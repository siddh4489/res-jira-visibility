    //var db = require('./pghelper'),
    var config = require('./config'),
    nforce = require('nforce'),
    session = require('express-session');
    
     
function managerList(req, res, next) {
    console.log('---getManager--->'+req);
    console.log('---getManager 1--->'+req.body.spassword);
    console.log('---getManager 2--->'+req.body.suser);
    console.log('---getManager 3 --->'+JSON.stringify(req.body));
    

    var oauth;
     org = nforce.createConnection({
            clientId: config.api.clientId,
            clientSecret: config.api.clientSecret,
            redirectUri: config.api.redirectUri,
            apiVersion: config.api.apiVersion,  // optional, defaults to current salesforce API version
            environment: 'sandbox',  // optional, salesforce 'sandbox' or 'production', production default
            mode: 'single' // optional, 'single' or 'multi' user mode, multi default
        });

    //org.authenticate({ username: userName, password: password}, function(err, resp) {
    console.log('-- task--Email--'+req.session.email);
    console.log('--tasl--Password--'+req.session.password);
    //org.authenticate({ username: req.body.suser, password: req.body.spassword}, function(err, resp) {
    org.authenticate({ username: req.session.email, password: req.session.password}, function(err, resp) {    
        if(!err) {
        var q = "SELECT Id,Name FROM User where  id = '00550000002ahmSAAQ'  or (managerid != '' and IsActive = true and managerid in ('00550000002ahmSAAQ','00538000004lNUdAAM'))";
 
        org.query({ query: q }, function(err, resp){
            
              if(!err && resp.records) {
                 console.log('---getManager List--->'+resp.records);
                 res.send(resp.records);
              }else{
                 res.send('No record Available');
              }
        });


        } else {
            console.log('nforce connection failed: ' + err.message);
            oauth = resp;
        }
    });
       
        
     
};

function getSkillset(req, res, next) {
    console.log('---getSkillset--->'+req.body.uid);
    console.log('---getSkillset 1--->'+req.body.spassword);
    console.log('---getSkillset 2--->'+req.body.suser);
    console.log('---getSkillset 3 --->'+JSON.stringify(req.body));
    

    var oauth;
     org = nforce.createConnection({
            clientId: config.api.clientId,
            clientSecret: config.api.clientSecret,
            redirectUri: config.api.redirectUri,
            apiVersion: config.api.apiVersion,  // optional, defaults to current salesforce API version
            environment: 'sandbox',  // optional, salesforce 'sandbox' or 'production', production default
            mode: 'single' // optional, 'single' or 'multi' user mode, multi default
        });

    //org.authenticate({ username: userName, password: password}, function(err, resp) {
    console.log('-- task--Email--'+req.session.email);
    console.log('--tasl--Password--'+req.session.password);
    //org.authenticate({ username: req.body.suser, password: req.body.spassword}, function(err, resp) {
    org.authenticate({ username: req.session.email, password: req.session.password}, function(err, resp) {    
        if(!err) {
        var q = "Select id,Expertise_in_Salesforce__c,Expertise_in_Other_Technologies__c from SkillSet__c WHERE createdbyId ='"+req.body.uid+"'";
        org.query({ query: q }, function(err, resp){
            
              if(!err && resp.records) {
                 console.log('---getSkillset List--->'+resp.records);
                 res.send(resp.records);
              }else{
                 res.send('No record Available');
              }
        });


        } else {
            console.log('nforce connection failed: ' + err.message);
            oauth = resp;
        }
    });
       
        
     
};

function createTask(req, res, next) {
    
    console.log('-- task created--Email--'+req.session.email);
    console.log('--tasl created--Password--'+req.session.password);
    var taskObj = nforce.createSObject('Task__c');
            taskObj.set('No_of_Hours__c', req.body.hours);
            taskObj.set('Project_Type__c', req.body.projecttype);
            taskObj.set('Task_Description__c', req.body.desc);
            taskObj.set('Name', req.body.name);
            taskObj.set('Manager__c', req.body.managerid);
            taskObj.set('System_Date__c', req.body.sysdate);
         
            //org.insert({ sobject: taskObj}, function(err, resp){
                //if (err) {
                //    console.log('First Task insert failed: ' + JSON.stringify(err));
                    org.authenticate({username: req.session.email, password: req.session.password}, function(err) {
                        if (err) {
                            console.log('Authentication failed: ' + JSON.stringify(err));
                            return next(err);
                        } else {
                            org.insert({ sobject: taskObj}, function(err, resp) {
                                if (err) {
                                    console.log('Second case insert failed: ' + JSON.stringify(err));
                                    return next(err);
                                } else {
                                    console.log('Second case insert worked');
                                    return res.send('ok');
                                }
                            });
                        }
                    });
                //} else {
                //    console.log('First case insert worked');
                //    res.send('ok');
               // }
           // });
   
};

function createSkillset(req, res, next) {
    
    console.log('-- skillset created--Email--'+req.session.email);
    console.log('-- skillset created--Password--'+req.session.password);
    console.log('-- skillset created--uid--'+req.session.uid);
    var skillObj = nforce.createSObject('SkillSet__c');
        skillObj.set('Expertise_in_Salesforce__c', req.body.sfdc);
        skillObj.set('Expertise_in_Other_Technologies__c', req.body.other);
                    org.authenticate({username: req.session.email, password: req.session.password}, function(err) {
                        if (err) {
                            console.log('Authentication failed: ' + JSON.stringify(err));
                            return next(err);
                        } else {

                                var q = "Select id,Expertise_in_Salesforce__c,Expertise_in_Other_Technologies__c from SkillSet__c WHERE createdbyId ='"+req.session.uid+"'";
                                org.query({ query: q }, function(err, resp){
            
                                      if(!err && resp.records.length>0) {
                                           console.log('Query Record: ' + JSON.stringify(resp.records));
                                           var skillset = resp.records[0];
                                            skillset.set('Expertise_in_Salesforce__c', req.body.sfdc);
                                            skillset.set('Expertise_in_Other_Technologies__c',req.body.other);
                                            org.update({ sobject: skillset}, function(err, resp){
                                              if(!err){
                                                 return res.send('ok');
                                              }
                                            });
                                          
                                      }else{
                                          console.log(' else ');
                                          org.insert({ sobject: skillObj}, function(err, resp) {
                                                if (err) {
                                                    console.log('Second case insert failed: ' + JSON.stringify(err));
                                                    return next(err);
                                                } else {
                                                    console.log('Second case insert worked');
                                                    return res.send('ok');
                                                }
                                            });
                                      }
                                });
                        }
                    });
};



function revokeToken(req, res, next) {
    org.revokeToken({token: org.oauth.access_token}, function(err) {
        if (err) {
            return next(err);
        } else {
            res.send('ok');
        }
    });

}

exports.getSkillset = getSkillset;
exports.createSkillset = createSkillset;
exports.createTask = createTask;
exports.managerList = managerList;
exports.revokeToken = revokeToken;
