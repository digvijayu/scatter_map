function clsMap(p_Config){
    var LMe = this;

    //Render the map to the container
    LMe.renderTo = "";
    //Width of the map
    LMe.width = window.innerWidth;
    //Height of the map
    LMe.height = window.innerHeight;
    //Owner of the map
    LMe.owner = null;
    //scale of the map
    LMe.scale = 1000;
    //Translate params for graph
    LMe.translatePar = [280, 350];

    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        //Create hint
        LMe.createHint();
    };

    //---------------------------------------------------------------
    LMe.drawMap = function(){

        //Draw the map in the container
        //Get projection
        LMe.projection = d3.geo.mercator()
            .scale(LMe.scale)
            .translate(LMe.translatePar);

        //get path for the graph
        LMe.path = d3.geo.path()
            .projection(LMe.projection);

        //add svg to the container
        LMe.svg = d3.select("#" + LMe.renderTo).insert("svg:svg", "h2")
            .attr("width", LMe.width)
            .attr("height", LMe.height);

        LMe.states = LMe.svg.append("svg:g")
            .attr("id", "states");

        //console.time('world map drawing');
        //Load the map data and draw the map
        d3.json("data/world-map.json", function(collection) {
            LMe.states.selectAll("path")
                .data(collection.features)
                .enter().append("svg:path")
                .attr("d", LMe.path)
                .on("click",function(d){
                });
            //console.timeEnd('world map drawing');
        });

        //add zoom effect
        LMe.zoom = d3.behavior.zoom()
            .scaleExtent([0.5, 6])
            .on("zoom",LMe.onMapZoom);

        //Bind zoom in out to buttons
        d3.select("#" + LMe.zoomInBtn).on('click', function(){
        });
        d3.select("#" + LMe.zoomOutBtn);

        LMe.svg.call(LMe.zoom);
    };

    //---------------------------------------------------------------
    LMe.onMapZoom = function(){
        LMe.states.attr("transform","translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
        var LCircles = LMe.svg.selectAll(".circle");
        LCircles.attr("transform","translate(" + d3.event.translate.join(",") + ") scale(" + (d3.event.scale) + ")");
        LMe.svg.selectAll("path").attr("d", LMe.path.projection(LMe.projection));
    };

    //---------------------------------------------------------------
    LMe.refreshData = function(){
        var LDataSize = LMe.owner.missionsDimGroup.size(),
            LData = LMe.owner.missionsDimGroup.top(LDataSize);

        function L_setCircleProperties(d, p_circle){
            var LMissionObj = LMe.getMissionObj(d.key);
            d.missionObj = LMissionObj;

            d3.select(p_circle).attr("class", "circle")
                .attr("cx", function(d){
                    return LMe.projection([LMissionObj.longitude, LMissionObj.latitude])[0];
                })
                .attr("cy", function(d){
                    return LMe.projection([LMissionObj.longitude, LMissionObj.latitude])[1];
                })
                .attr("r", LMe.getRadius)
//                .style("fill", "purple")
                .attr("fill", "#F7931E")
                .attr("stroke-width",.5)
                .attr("stroke", "white")
                .attr("fill-opacity", .5)
                .on("mouseover", LMe.onBubbleMouseHover)
                .on("mousemove", LMe.onBubbleMouseMove)
                .on("mouseout", LMe.onBubbleMouseOut)
                .on("click",function(d,i){
                    LMe.owner.HandleMissionBubbleClick(d, this);
                });
        }

        //Draw circles
        var LCircles = LMe.svg.selectAll(".circles").data(LData);
        LCircles.each(function(d){
            var LCircle = this;
            L_setCircleProperties(d, LCircle);
        });

        //remove the circles
        LCircles.exit().remove();

        //add new circles
        var LNewCircles = LCircles.enter().append("svg:circle");
        LNewCircles.each(function(d){
            var LCircle = this;
            L_setCircleProperties(d, LCircle);
        });

        LMe.circles = LCircles;
    };

    //---------------------------------------------------------------
    LMe.getMissionObj = function(p_missionName){
        var LData = G_ChartData.missions;
        for(var LLoopIndex = 0; LLoopIndex < LData.length; LLoopIndex++)
        {
            var LObj = LData[LLoopIndex];
            if(LObj.mission == p_missionName)
            {
                return LObj;
            }
        }
    };

    //---------------------------------------------------------------
    LMe.createHint = function(){
        LMe.tooltip = d3.select("#tooltip");


        //We will need another set of cross fitler data for data in
        LMe.hintReports = crossfilter(G_ChartData.reports);

        LMe.missionsDimension = LMe.hintReports.dimension(function(d){ return d.mission; });
        LMe.missionsDimGroup = LMe.missionsDimension.group();

        LMe.monthDimenstion = LMe.hintReports.dimension(function(d){ return d.month; });
        LMe.monthDimGroup = LMe.monthDimenstion.group();

        LMe.subjectDimension = LMe.hintReports.dimension(function(d){ return d.subject; });
        LMe.subjectDimGroup = LMe.subjectDimension.group();

        LMe.tooltipGraphTitle = LMe.tooltip.select(".hint-title");
        LMe.tooltipGraphDiv = LMe.tooltip.select("#hint-chart-div");
        LMe.tooltipTxtDiv = LMe.tooltip.select("#major-subjects");


        LMe.tooltipChart = dc.lineChart("#hint-chart-div")
            .width(200)
            .height(50)
            .margins({top: 10, right: 10, bottom: 20, left: 30})
            .title(function(d){
                return "Activity";
            })
            .dimension(LMe.monthDimenstion)
            .group(LMe.monthDimGroup)
            .valueAccessor(function(d) {
                return d.value;
            })
            .x(d3.time.scale().domain([new Date(2011, 11, 1), new Date(2014, 3, 31)]))
            .elasticY(true)
            .brushOn(false);

        LMe.tooltipChart.yAxis().ticks(2);
        LMe.tooltipChart.xAxis().ticks(2);

        LMe.tooltipChart.render();
    };

    //---------------------------------------------------------------
    LMe.viewToolTip = function(d){
        var currHeight = LMe.tooltip.style("height").slice(0,-2),
            w = LMe.owner.width;
        LMe.tooltip.style("visibility", "visible")
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

    //---------------------------------------------------------------
    LMe.syncSelectedMissions = function(p_HasFilter, p_FilterValues){
        if(! p_HasFilter)
        {
            //Select All circles
            LMe.circles.attr("fill","#F7931E");
            return;
        }

        LMe.circles.each(function(d){
            var LMissionName = d.key;
            if(p_FilterValues.indexOf(LMissionName) > -1)
            {
                //The mission is selected
                d3.select(this).attr("fill","#F7931E");
            }
            else
            {
                d3.select(this).attr("fill","#EEEEEE");
            }
        });
    };
    //---------------------------------------------------------------
    LMe.updateCircles = function(){
        LMe.circles.transition().duration(500).attr("r", LMe.getRadius);
    };

    //---------------------------------------------------------------
    LMe.getRadius = function(d){
        var LDocCount = d.value,
            LRadius = Math.sqrt(LDocCount)/1.2;
        return LRadius;
    };

    //---------------------------------------------------------------
    LMe.onBubbleMouseHover = function(d){
        var LColor = d3.rgb(d3.select(this).attr("fill"));
        d3.select(this)
            .attr("stroke-width","4px")
            .attr("stroke", LColor.darker());

        var currentText = d.missionObj.mission;
        LMe.viewToolTip(d);

        LMe.missionsDimension.filter(d.key);
        LMe.tooltipChart.redraw();

        LMe.missionsDimension.filter(d.key);

        LMe.tooltipGraphTitle.html(d.missionObj.mission);

        var LMajorSubjects = LMe.subjectDimGroup.top(3);
        //add major subjects
        LMe.tooltipTxtDiv.selectAll("*").remove();
        for(var LLoopIndex = 0; LLoopIndex < LMajorSubjects.length; LLoopIndex++)
        {
            var LSubjectIndex = LMajorSubjects[LLoopIndex].key,
                LSubjectItem = G_SUBJECTS[LSubjectIndex];
            LMe.tooltipTxtDiv.append("img")
                .attr("class", "major-subjects-img")
                .attr("src", LSubjectItem.image);
        }

        /*LMe.tooltipTxtDiv.html(function(){
            return d.missionObj.mission + "<br>" + d.missionObj.name
        });*/
    };

    //---------------------------------------------------------------
    LMe.onBubbleMouseOut = function(d){
        LMe.tooltip.style("visibility","hidden");

        d3.select(this)
            .attr("stroke-width","0.5px")
            .attr("stroke", "#FFF");
    };

    //---------------------------------------------------------------
    LMe.onBubbleMouseMove = function(d){
        LMe.viewToolTip(d);
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}