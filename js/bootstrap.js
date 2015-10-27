var G_ChartData = {
    reports : [],
    missions : []
};

//var G_SUBJECTS = ["Type A", "Type B", "Type C", "Type D", "Type E", "Type F"];
var G_SUBJECTS = {
    "0" : {
        "caption" : "Type A",
        "image" : "img/subjects/Type A.gif",
        "hover-image" : "img/subjects/Type A_hover.gif"
    },
    "1" : {
        "caption" : "Type B",
        "image" : "img/subjects/Type B.gif",
        "hover-image" : "img/subjects/Type B_hover.gif"
    },
    "2" : {
        "caption" : "Type C",
        "image" : "img/subjects/Type C.gif",
        "hover-image" : "img/subjects/Type C_hover.gif"
    },
    "3" : {
        "caption" : "Type D",
        "image" : "img/subjects/Type D.gif",
        "hover-image" : "img/subjects/Type D_hover.gif"
    },
    "4" : {
        "caption" : "Type E",
        "image" : "img/subjects/Type E.gif",
        "hover-image" : "img/subjects/Type E_hover.gif"
    },
    "5" : {
        "caption" : "Type F",
        "image" : "img/subjects/Type F.gif",
        "hover-image" : "img/subjects/Type F_hover.gif"
    }
};

var G_MSG = {
    "ExpandReportsTable" : "Click here to collapse Reports",
    "CollapseReportsTable" : "Click here to expand Reports"
};


//---------------------------------------------------------------
//add custom scroll bar to the div
(function($){
    setTimeout(function(){
        $("#mission-selectr-scroll").mCustomScrollbar();
    }, 3000);
    $(window).load(function(){
        $("#mission-selectr-scroll").mCustomScrollbar();
    });
})(jQuery);

//---------------------------------------------------------------
function loadChartData(p_FnCallback){
    d3.csv("data/listofmissions_01.csv", function(missions) {
        G_ChartData.missions = missions;
        //missions file is loaded
        d3.csv("data/reports.csv", function(reports){
            //reports have been loaded
            G_ChartData.reports = reports;

            //call the callback function
            p_FnCallback(G_ChartData);


        });
    });
};

var G_Manager = null;
//---------------------------------------------------------------
function bootstrap(){

                //return;
    d3.selectAll(".floating-containers").style("display", "none");
    console.time('loading page');
    console.time('loading-reports-file');
    //Load the chart data
    loadChartData(function(){
        console.timeEnd('loading-reports-file');

        //Chart data has been loaded
        var LMgr = new clsVisualizationMgr();

        console.time('preparing-data');
        LMgr.prepareData();
        console.timeEnd('preparing-data');

        console.time('creating-map');
        LMgr.createMap();
        console.timeEnd('creating-map');

        console.time('time-selector');
        LMgr.createTimeSelector();
        console.timeEnd('time-selector');

        console.time('mission-selector');
        LMgr.createMissionsSelector();
        console.timeEnd('mission-selector');

        console.time('subject-selector');
        LMgr.createSubjectSelector();
        console.timeEnd('subject-selector');

        console.time('source-selector');
        LMgr.createSourceSelector();
        console.timeEnd('source-selector');

        console.time('tag-selector');
        LMgr.createTagFilter();
        console.timeEnd('tag-selector');

        console.time('reports-table');
        LMgr.createReportsTable();
        console.timeEnd('reports-table');

        G_Manager = LMgr;
        console.timeEnd('loading page');
        d3.selectAll(".floating-containers").style("display", "block");
    });



    return;

    var G_MISSION_SELECTOR;
    var w = 700,
        h = 650;
    var projection = d3.geo.mercator()
        .scale(1000)
        .translate([280, 350]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map-container").insert("svg:svg", "h2")
        .attr("width", w)
        .attr("height", h);

    var states = svg.append("svg:g")
        .attr("id", "states");

    var circles = svg.append("svg:g")
        .attr("id", "circles");

    var dateFormat = d3.time.format("%e-%b-%y");

    var G_FILTERS = {
        dateFilter : [],
        missionFilter : [],
        openDoc: "",
        openDocCount: ""
    };


    var G_CIRCLES;

    var tooltip = d3.select("body")
        .append("div")
        .attr("id","tooltip")
        .style("position", "absolute")
        .style("background","rgba(0,0,0,.8)")
        .style("top",0)
        .style("width","200px")
        .style("z-index", "99999")
        .style("visibility", "hidden")
        .text("hi");

    var tooltip2 = d3.select("body")
        .append("div")
        .attr("id","tooltip2")
        .style("background","rgba(102,102,102,.9)")
        .style("position", "absolute")
        .style("top", 0)
        .style("z-index", "99999")
        .style("visibility", "hidden")
        .text("");


//MAP
    d3.json("data/world-map.json", function(collection) {
        states.selectAll("path")
            .data(collection.features)
            .enter().append("svg:path")
            .attr("d", path)
            .on("click",function(d){
                //console.log(d.properties.NAME);
            });
    });
    var places;
    //PLACES (links)
    d3.csv("data/listofmissions_01.csv", function(missions) {
        d3.csv("data/reports.csv", function(reports){

            // format our data...
            reports.forEach(function(d) {
                d.dtg   = dateFormat.parse(d.date);
                d.subject = Math.floor(Math.random() * 5) + 1;
            });
            //console.log(reports);

            /****************************************
             *   Run the data through crossfilter    *
             ****************************************/

            var facts = crossfilter(reports);  // Gets our 'facts' into crossfilter
            //console.log(facts);

            /******************************************************
             * Create the Dimensions                               *
             * A dimension is something to group or filter by.     *
             * Crossfilter can filter by exact value, or by range. *
             ******************************************************/

            // for Mission
            var missionValue = facts.dimension(function (d) {
                return d.mission;       // group or filter by mission
            });
            var missionGroup = missionValue.group();
            //console.log(missionGroup);

            // for Date
            var dateValue = facts.dimension(function (d) {
                return d.date;       // group or filter by mission
            });

            //need to create dimensions for:
            //subject type
            //tags (bubble chart?)
            //urgency

//console.log(missionValue);

            var counter=0;
            //for each list of missions row
            //count # of reports from that mission
            missions.forEach(function(l,i){
                l.count=0;
                reports.forEach(function(e,i){
                    if(l.mission == e.mission){
                        l.count++;
                    }
                    l.currCount = l.count;
                });
                //console.log(l.mission + ": " + l.count);
                counter = counter + l.count;
            });

            var viewingNow;

            LCircles = circles.selectAll("path")
                .data(missions);
            LCircles.enter().append("svg:circle")
                .attr("class", "circle")
                .attr("cx", function(missions){
                    return projection([missions.longitude, missions.latitude])[0];
                })
                .attr("cy", function(missions){
                    return projection([missions.longitude, missions.latitude])[1];
                })
                .attr("r", function(missions){
                    return missions.count/8;
                })
                .style("fill", "purple")
                .style("stroke-width",.5)
                .style("stroke", "white")
                .style("fill-opacity", .5)
                .on("mouseover",function(d){
                    var currentText = d.mission;
                    L_viewTooltip(d);
                    tooltip.html(function(){
                        return d.mission + "<br>" + d.name
                    });
                    d3.select(this).transition().duration(500).style("fill","orange");
                })
                .on("mousemove", function(d){
                    L_viewTooltip(d);
                })
                .on("mouseout", function(){
                    tooltip.style("visibility","hidden");
                    if(this != viewingNow){
                        //console.log("notclicked");
                        d3.select(this).transition().duration(500).style("fill","purple");
                    }else{
                        //console.log("this was clicked");
                    }
                })
                .on("click",function(d,i){
                    d3.select(viewingNow).transition().duration(500).style("stroke-width", ".5");
                    d3.select(viewingNow).style("fill", "purple");
                    viewingNow = this;
                    d3.select(viewingNow).transition().duration(1000).style("stroke-width", "2");
                    d3.select(viewingNow).style("fill", "orange");
                    G_FILTERS.openDoc = d.mission;
                    L_getReports();
                });

            G_CIRCLES = LCircles;

            function L_viewTooltip(d){
                var currHeight = tooltip.style("height").slice(0,-2);
                tooltip.style("visibility", "visible")
                    .style("top", (d3.event.pageY-currHeight-25)+"px")
                    .style("left", function(){
                        if(d3.event.pageX-100 < 15){
                            return "15px"
                        } else if(d3.event.pageX+100 > w){
                            return (w-200)+"px";
                        } else{
                            return (d3.event.pageX-100)+"px"
                        }
                    });

            };

            function L_getReports(){
                var newText = "";
                var newCount =0;
                reports.filter(function(r){return r.mission == G_FILTERS.openDoc}).forEach(function(r,i){
                    if(dateFormat.parse(r.date) >= G_FILTERS.dateFilter[0]
                        && dateFormat.parse(r.date) <= G_FILTERS.dateFilter[1]){
                        newCount++;
                        document.getElementById("doc-count").innerHTML =  newCount + " results" ;
                        newText += "<p><span>" + r.date + "</span>"+ ": " + r.description + "</p>";
                    }
                });
                document.getElementById("doc-group").innerHTML = G_FILTERS.openDoc ;
                //adding each report entry
                document.getElementById("doc-list").innerHTML = newText;

            };


            function L_FilterScatterChart(){
                LCircles.transition().duration(function(d){return Math.random()*500}).style("opacity", "0");
                var LSelectedMissions = G_FILTERS.missionFilter,
                    LSelectedDate = G_FILTERS.dateFilter;
                var LFilteredCircles = LCircles.filter(function(missions){
                    if(! missions)
                    {
                        //Invalid data
                        return false;
                    }
                    for(var LLoopIndex = 0; LLoopIndex < LSelectedMissions.length; LLoopIndex++)
                    {
                        if(missions.mission == LSelectedMissions[LLoopIndex])
                        {
                            return true;
                        }
                    }
                });
                LFilteredCircles.transition().duration(function(d){return Math.random()*1000}).style("opacity", "1");
            };


            //Create the mission selector and draw the chart
            LConfig = {
                height : 650,
                width : 300,
                containerId : 'mission-selector-cntnr',
                data : reports,
                dataMiss : missions,
                onMissionFilter : function(p_selectedMissions, p_dateExtent){
                    G_FILTERS.missionFilter = p_selectedMissions;
                    L_FilterScatterChart();
                }
            };
            var LMissionSelector = new clsMissionSelector(LConfig);

            G_MISSION_SELECTOR = LMissionSelector;

            LTimeSelectorConfig = {
                height : 50,
                width : 700,
                svgId : 'time-filter-scale',
                data : reports,
                dataMiss : missions,
                onTimeFilter : function(p_dateExtent){
                    G_FILTERS.dateFilter = p_dateExtent;
                    L_getReports();
                    //L_FilterScatterChart();
                },
            };
            var LTimeSelector = new clsTimeSelector(LTimeSelectorConfig);
        });
    });

    function drawButton(){

    };

    var zoom = d3.behavior.zoom()
        //.scale(1 << 1)
        .on("zoom",function() {
            states.attr("transform","translate("+ d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            circles.attr("transform","translate("+ d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            svg.selectAll("path") .attr("d", path.projection(projection));
            //console.log("zoom scale " + d3.event.scale)
        });

    svg.call(zoom);
};
