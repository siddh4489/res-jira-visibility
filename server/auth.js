var bcrypt = require('bcrypt'),
    //db = require('./pghelper'),
    config = require('./config'),
    uuid = require('node-uuid'),
    session = require('express-session'),
    Q = require('q'),
    validator = require('validator'),
    winston = require('winston'),
    invalidCredentials = "Please check your username and password. If you still can't log in, contact your Salesforce administrator.";

/**
 * Encrypt password with per-user salt
 * @param password
 * @param callback
 */
function encryptPassword(password, callback) {
    winston.info('encryptPassword');
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return callback(err);
        }
        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });
    });
}

/**
 * Compare clear with hashed password
 * @param password
 * @param hash
 * @param callback
 */
function comparePassword(password, hash, callback) {
    winston.info('comparePassword');

    bcrypt.compare(password, hash, function (err, match) {
        if (err) {
            return callback(err);
        }
        return callback(null, match);
    });
}

/**
 * Create an access token
 * @param user
 * @returns {promise|*|Q.promise}
 */
function createAccessToken(user) {
    winston.info('createAccessToken');
    var token = uuid.v4(),
        deferred = Q.defer();
    
    db.query('INSERT INTO tokens (userId, externalUserId, token) VALUES ($1, $2, $3)', [user.id, user.externaluserid, token])
        .then(function() {
            deferred.resolve(token);
        })
        .catch(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

/*function to insert the random code for forgotpassword functionality */
function forgotpassword(req, res, next) {

    winston.info('forgotpassword called');
    
    var data = req.body;
    JSON.stringify('data is'+data);
    db.query('INSERT INTO salesforce.forgotpassword (email,code,status) VALUES ($1, $2, $3)', [data.email, data.code, true])
        .then(function() {
            console.log('record inserted');
            return res.send('OK');
        }).catch(function(err) {
            console.log('error'+err);
            return next(err);    
        });
};

/* function to verify the verification code entered by the user*/
function verify(req, res, next) {
    winston.info('verifycode');

    var creds = req.body;
    console.log(JSON.stringify(creds));

    db.query('SELECT  email,code,status FROM salesforce.forgotpassword WHERE code=$1 AND email=$2 and status=$3', [creds.verifycode,creds.email,'true'], true)
        .then(function (data) {
            console.log(JSON.stringify(data));
                if (data !==undefined && data!=='') {
                    console.log('data found');    
                    return res.send({'status': 'match'});
                } else {
                    console.log('data not found');    
                    return res.send({'status': 'mismatch'});
                }
        }).catch(function(err) {
            return next(err);   
        });
};

/* function to update the password of the user */
function updatepassword(req, res, next) {

    winston.info('update password');

    var user = req.body;
    console.log(JSON.stringify(user));
    
    db.query('SELECT id FROM salesforce.contact WHERE email=$1', [user.email], true)
        .then(function (u) {
            encryptPassword(user.password, function (err, hash) {
                if (err) return next(err);
                updateUserPassword(user, hash)
                    .then(function (data) {
                        return res.send('OK');
                    })
                    .catch(next);
            });
        })
        .catch(next);
};

function updateUserPassword(user, password) {
    var deferred = Q.defer();
    console.log('update user password called');
    db.query('Update salesforce.contact set password__c=$1 where email=$2',[password,user.email],true)
        .then(function (user) {
        	console.log('password updated success');
            deferred.resolve();	
        })
        .catch(function(err) {
        	console.log('password not updated'+err)
            deferred.reject(err);
    }); 
    
	return deferred.promise;
};


/* function to update the status of the verification code when the password has been updated successfully */
function updateVerificatonCodeStatus(req, res, next) {
    winston.info('update verificatoin code status');

    var user = req.body;
    console.log(JSON.stringify(user));
    
    db.query('Update salesforce.forgotpassword set status=$1 where email=$2',['false',user.email],true)
        .then(function (user) {
        	console.log('verificatoin code updated success');
            return res.send('OK');
        })
        .catch(function(err) {
        	console.log('verificatoin not code updated success'+err)
			return next(err);   
    }); 
};

/**
 * Regular login with application credentials
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function sflogin(req, res, next) {
    var creds = req.body;
    var ses;
    ses=req.session;	
    ses.email=req.body.email;
    ses.password = req.body.password;	
    	
    	
    var nforce = require('nforce');
    //var userName = config.api.userName,
    //var password = config.api.password;
    var oauth;
    var org = nforce.createConnection({
        clientId: config.api.clientId,
        clientSecret: config.api.clientSecret,
        redirectUri: config.api.redirectUri,
        apiVersion: config.api.apiVersion,  // optional, defaults to current salesforce API version
        environment: 'sandbox',  // optional, salesforce 'sandbox' or 'production', production default
        mode: 'single' // optional, 'single' or 'multi' user mode, multi default
    });
	
 console.log('---DC---'+creds.email);
 console.log('---DC 1---'+creds.password);
//org.authenticate({ username: userName, password: password}, function(err, resp) {
org.authenticate({ username: creds.email, password: creds.password}, function(err, resp) {
    if(!err) {
        console.log('nforce connection succeeded...'+org.oauth.access_token);
        console.log('nforce connection succeeded...'+resp);
	        var userquery = "SELECT Id, Firstname,name,username FROM user Where username ='"+creds.email+"'";
		org.query({ query: userquery}, function(err, resp1){

		      if(!err && resp1.records) {
			      return res.send({'email':ses.email,'status':'1','token':org.oauth.access_token,'runninguser':resp1.records,'sfuser':creds.email,'sfpassword':creds.password});
		      }else{
			 //res.send({'status':'1','error':err.message});
		      }
		}); 
	    
        //return res.send({'status':'1','token':org.oauth.access_token,'sid1':'raj1','luser':loggedUser});
     
    } else {
        console.log('nforce connection failed:- ' + err.message);
        //oauth = resp;
	//console.log('---err----'+invalidCredentials);    
	return res.send(401,invalidCredentials);
    
    }
});
    //return res.send('Hello '+creds.email);	
};

/**
 * Regular login with application credentials
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function login(req, res, next) {
    winston.info('login');

    var creds = req.body;
    console.log(creds);

    // Don't allow empty passwords which may allow people to login using the email address of a Facebook user since
    // these users don't have passwords
    if (!creds.password || !validator.isLength(creds.password, 1)) {
        return res.send(401, invalidCredentials);
    }

    db.query('SELECT id, firstName, lastName, email,loyaltyid__c as externalUserId, password__c AS password FROM salesforce.contact WHERE email=$1', [creds.email], true)
        .then(function (user) {
            if (!user) {
                return res.send(401, invalidCredentials);
            }
            comparePassword(creds.password, user.password, function (err, match) {
                if (err) return next(err);
                if (match) {
                    createAccessToken(user)
                        .then(function(token) {
                            return res.send({'user':{'email': user.email, 'firstName': user.firstname, 'lastName': user.lastname,'isformfilled':user.mg_isformfilled__c}, 'token': token});
                        })
                        .catch(function(err) {
                            return next(err);    
                        });
                } else {
                    // Passwords don't match
                    return res.send(401, invalidCredentials);
                }
            });
        })
        .catch(next);
};

/**
 * Logout user
 * @param req
 * @param res
 * @param next
 */
function logout(req, res, next) {
	req.session.reset();
	res.redirect('/');
	
/*req.session.destroy(function(err){
	if(err){
		console.log(err);
	}
	else
	{
		res.redirect('/');
	}
});*/
    /*winston.info('logout');
    var token = req.headers['authorization'];
    winston.info('Logout token:' + token);
    db.query('DELETE FROM tokens WHERE token = $1', [token])
        .then(function () {
            winston.info('Logout successful');
            res.send('OK');
        })
        .catch(next);*/
};

/**
 * Signup
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function signup(req, res, next) {

    winston.info('signup');

    var user = req.body;

    if (!validator.isEmail(user.email)) {
        return res.send(400, "Invalid email address");
    }
    if (!validator.isLength(user.firstName, 1) || !validator.isAlphanumeric(user.firstName)) {
        return res.send(400, "First name must be at least one character");
    }
    if (!validator.isLength(user.lastName, 1) || !validator.isAlphanumeric(user.lastName)) {
        return res.send(400, "Last name must be at least one character");
    }
    if (!validator.isLength(user.password, 4)) {
        return res.send(400, "Password must be at least 4 characters");
    }

    db.query('SELECT id FROM salesforce.contact WHERE email=$1', [user.email], true)
        .then(function (u) {
            if(u) {
                return next(new Error('Email address already registered'));
            }
            encryptPassword(user.password, function (err, hash) {
                if (err) return next(err);
                createUser(user, hash)
                    .then(function () {
                        return res.send('OK');
                    })
                    .catch(next);
            });
        })
        .catch(next);
};

/**
 * Create a user
 * @param user
 * @param password
 * @returns {promise|*|Q.promise}
 */
function createUser(user, password) {

    var deferred = Q.defer(),
        externalUserId = (+new Date()).toString(36); // TODO: more robust UID logic

    db.query('INSERT INTO salesforce.contact (email, password__c, firstname, lastname, leadsource, loyaltyid__c, accountid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, firstName, lastName, email, loyaltyid__c as externalUserId',
        [user.email, password, user.firstName, user.lastName, 'Mailgapp App', externalUserId, config.contactsAccountId], true)
        .then(function (insertedUser) {
            deferred.resolve(insertedUser);
        })
        .catch(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

/**
 * Validate authorization token
 * @param req
 * @param res
 * @param next
 * @returns {*|ServerResponse}
 */
function validateToken (req, res, next) {
    var token = req.headers['authorization'];
    if (!token) {
        token = req.session['token']; // Allow token to be passed in session cookie
    }
    if (!token) {
        winston.info('No token provided');
        return res.send(401, 'Invalid token');
    }
    db.query('SELECT * FROM tokens WHERE token = $1', [token], true, true)
        .then(function (item) {
            if (!item) {
                winston.info('Invalid token');
                return res.send(401, 'Invalid token');
            }
            req.userId = item.userid;
            req.externalUserId = item.externaluserid;
            return next();
        })
        .catch(next);
};

exports.login = login;
exports.sflogin = sflogin
exports.logout = logout;
exports.signup = signup;
exports.createUser = createUser;
exports.createAccessToken = createAccessToken;
exports.validateToken = validateToken;
exports.forgotpassword=forgotpassword;
exports.verify=verify;
exports.updatepassword=updatepassword;
exports.updateVerificatonCodeStatus=updateVerificatonCodeStatus;
