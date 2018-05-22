angular.module('nibs.chart', ['nibs.config'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.chart', {
                url: "/chart",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/chart.html",
                        controller: "ChartController"
                    }
                }
            })
    
           .state('app.chart1', {
                url: "/projectchart",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/projectchart.html",
                        controller: "ProjectChartController"
                    }
                }
            })

    })

    // Services
    .factory('Chart', function ($http, $rootScope) {
        return {
            getChartList: function(theData) {
                return $http.post($rootScope.server.url + '/chart', theData);
            },
            getProjectChartList: function(theData) {
                return $http.post($rootScope.server.url + '/projectchart', theData);
            }
        };
    })

    //Controllers
    .controller('ChartController', function ($scope,$rootScope, $window, $ionicPopup,Chart,User) {
	var amonth;
	var year;
       $scope.sfu = {'date':'','suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword')};
	$('.monthYearPicker').datepicker({
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		dateFormat: 'MM yy'
	}).focus(function() {
		var thisCalendar = $(this);
		$('.ui-datepicker-calendar').detach();
		$('.ui-datepicker-close').click(function() {
		var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
	        year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();	
	        amonth = parseInt(month)+1;
		if(amonth<10) {
            	   amonth = '0'+amonth
        	} 	
		$scope.title = amonth +'/'+year;
		$scope.sfu.date =  amonth+'/%%/'+year;
	
		thisCalendar.datepicker('setDate', new Date(year, month, 1));
			
		});
	});
	
       $rootScope.username = $window.localStorage.getItem('username');

       $scope.sfu = {'suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword')};
 $scope.view = function () {
	Chart.getChartList($scope.sfu).success(function(datalist) {
           
    google.charts.load("current", {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);
	$(window).on("throttledresize", function (event) {
    		drawChart();
	});		
    function drawChart() {
	  if($scope.title == undefined){
	     	var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(mm<10) {
		    mm = '0'+mm
		} 
		  $scope.title = mm+'/'+yyyy;
	     }
        var data = new google.visualization.DataTable();
            data.addColumn('string','Employee');
            data.addColumn('number','Total Hours')
            for(var i =0; i<datalist.length;i++){
                var r = datalist[i];
                data.addRow([(r.name).split(" ")[0], parseInt(r.hr)]); 
              }

          var view = new google.visualization.DataView(data);
          view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" }
                       ]);
              var options = {
                title: 'Report Month : '+$scope.title,
		tooltip: {
		    isHtml: true,
		    trigger: 'both'
		},
                hAxis: {
                //direction:-1,
                slantedText:true,
                slantedTextAngle:90,
	        title: 'Employees',
		minValue: 0,
            },vAxis: {
		  title: 'Total Hours'
		},
		      
            width: '100%',
            height: '100%',
            //bar: {groupWidth: "30%"},
            legend: { position: "left" },
          };
          var chart = new google.visualization.ColumnChart(document.getElementById("chart"));
          chart.draw(view, options);
             }  
         
       });
};
      
    })
    
  .controller('ProjectChartController', function ($scope,$rootScope, $window, $ionicPopup,Chart,User) {
       $scope.sfu = {'date':'','suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword')};
	var amonth;
	var year;
	$('.monthYearPicker').datepicker({
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		dateFormat: 'MM yy'
	}).focus(function() {
		var thisCalendar = $(this);
		$('.ui-datepicker-calendar').detach();
		$('.ui-datepicker-close').click(function() {
		var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
	        year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();	
	        amonth = parseInt(month)+1;
		if(amonth<10) {
            	   amonth = '0'+amonth
        	} 	
		
		$scope.title = amonth+'/'+year;	
		$scope.sfu.date =  amonth+'/%%/'+year;
	
		thisCalendar.datepicker('setDate', new Date(year, month, 1));
			
		});
	});	
	
       $rootScope.username = $window.localStorage.getItem('username');

       $scope.sfu = {'suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword')};
$scope.view = function () {
       	if($scope.title == undefined){
	     	var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(mm<10) {
		    mm = '0'+mm
		} 
		  $scope.title = mm+'/'+yyyy;
	     }
       Chart.getProjectChartList($scope.sfu).success(function(datalist) {
	    google.charts.load('current', {'packages':['corechart','corechart', 'bar']});
            google.charts.setOnLoadCallback(drawbarChart);
           $(window).on("throttledresize", function (event) {
    		drawbarChart();
	});
           function drawbarChart() {                                                        
                                                                      
                var data = new google.visualization.DataTable();
                data.addColumn('string','Employees');
                data.addColumn('number','Subscription');
                data.addColumn('number','Deployment time reduction');
                data.addColumn('number','Code Optimization');
                data.addColumn('number','Config Cleanup');
                data.addColumn('number','Data Purge');
                data.addColumn('number','Platform Enhancements');
                data.addColumn('number','UIPM');
                data.addColumn('number','INC');
                data.addColumn('number','Self Study');
               
                var projectType = ["Subscription","Deployment time reduction","Code Optimization","Config Cleanup","Data Purge","Platform Enhancements","UIPM","INC","Self Study"];  

				var names = [];
				var index;
				for(var i=0;i<datalist.length;i++)
				{
					index= names.indexOf(datalist[i].name);
					
					if(index == -1)
					{
					 names.push(datalist[i].name);
					}
				}
				var abc="";
				var hr;
				for(i=0;i<names.length;i++){
					abc="";
					abc+=names[i];
					
					for(j=0;j<projectType.length;j++)
					{
					  hr=0;
					for(k=0;k<datalist.length;k++)
					 {
						   if(names[i]==datalist[k].name && projectType[j] == datalist[k].project_type__c)
						   {
						   console.log(names[i]+"  "+projectType[j]+" "+datalist[k].hr);
					   hr=datalist[k].hr;       
						   }
						}
						if(hr!=0)
						{
						 abc+=","+hr;
						}
						else
						{
						 abc+=","+"0";
						}
					}
					//alert(""+abc);
					data.addRow([(abc.split(",")[0]).split(" ")[0], parseInt(abc.split(",")[1]), parseInt(abc.split(",")[2]),parseInt(abc.split(",")[3]),parseInt(abc.split(",")[4]),parseInt(abc.split(",")[5]),parseInt(abc.split(",")[6]),parseInt(abc.split(",")[7]),parseInt(abc.split(",")[8]),parseInt(abc.split(",")[9])]); 

				}


                       var view = new google.visualization.DataView(data);
			   view.setColumns([0, 1,
				       { calc: "stringify",
					 sourceColumn: 1,
					 type: "string",
					 role: "annotation" }
				       ]);


			var options = {
				title: 'Report Month : '+$scope.title,
				width: '100%',
            			height: '100%',
				legend: { position: 'top', maxLines: 4 },
				isStacked: true,
				 tooltip: {
				    isHtml: true,
				    trigger: 'both'
				},
				hAxis: {
				  title: 'Total Hours',
				  minValue: 0,
				},
				vAxis: {
				  title: 'Employees'
				},
			  };

                var chart = new google.visualization.BarChart(document.getElementById('projectchart_div'));
                chart.draw(data, options);
              }


       });
	};
       
    });

  
