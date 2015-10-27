//To generate the time line we need to know which are the documents which contain the words
//And after that we need to get how many occurances are there
//In order to generate the time line we need the minimum and maximum time
//So we have to load the data file json

/*
 * 1. Get which documents have the words
 * 2. Get the occurances in each document
 * 3. Draw the graph*
 */

function clsTimeSelector(p_Config){
    var LMe = this;

    //svg id
    LMe.svgId = "";


    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        /*LMe.svg = d3.select("#" + LMe.svgId)
            .attr("width", LMe.width + "px")
            .attr("height", LMe.height + "px");

        //draw the axis
        LMe.drawAxis();*/
        d3.select("#" + LMe.renderTo).style("height", LMe.height);
        LMe.chart = dc.barChart("#" + LMe.renderTo);
    };


    //---------------------------------------------------------------
    LMe.drawChart = function(){
        var LDimenstion = LMe.owner.monthDimenstion,
            LGroup = LMe.owner.monthDimGroup;

        var LAllData = LDimenstion.top(Infinity);
        LMe.chart.width(LMe.width)
            .height(LMe.height)
            .margins({top: 10, right: 0, bottom: 20, left: 30})
            .dimension(LDimenstion)
            .group(LGroup)
            .centerBar(true)
            .elasticY(true)
            .ordinalColors(['#D9E021'])
            .gap(3)
//            .x(d3.time.scale().domain(LMe.owner.dateExtent))
            .x(d3.time.scale().domain([new Date(2011, 11, 1), new Date(2014, 3, 31)]))
            .round(d3.time.month.round)
            //.alwaysUseRounding(true)
            .xUnits(d3.time.months)
            .on("filtered", function(chart, filter){
                LMe.owner.handleOnFiltered();
            });

        LMe.chart.yAxis().ticks(1);
        LMe.chart.xAxis().ticks(2);

        LMe.chart.render();

        //Bind reset event
        if(! LMe.resetBtnId)
        {
            //Reset button is not assigned
            return;
        }

        d3.select("#" + LMe.resetBtnId).on('click', function(d){
            LMe.reset();
        });

    };

    //---------------------------------------------------------------
    LMe.reset = function(){
        //Clear filters
        LMe.chart.filterAll();
        LMe.chart.redraw();
    };

    //---------------------------------------------------------------
    /*LMe.drawAxis = function(){
        LMe.dateExtent = d3.extent(LMe.data.map(function(d) {
            return LMe.owner.dateFormat.parse(d.date);
        }));
        *//*LMe.dateMin = d3.min(LMe.data.map(function(d){
            return LMe.owner.dateFormat.parse(d.date);
        }));
        LMe.dateMax = d3.max(LMe.data.map(function(d){
            return LMe.owner.dateFormat.parse(d.date);
        }));*//*
        LMe.zoomScale = d3.time.scale()
            .range([0, LMe.width - 12])
            .domain(LMe.dateExtent);
           // console.log(LMe.dateExtent);
        
        LMe.onTimeFilter(LMe.dateExtent);

        LMe.xAxis = d3.svg.axis().scale(LMe.zoomScale).orient('bottom').tickSize(0).tickPadding(10);
        LMe.brush = d3.svg.brush()
            .x(LMe.zoomScale)
            //.extent([new Date(2016, 3, 4), new Date(2016, 3, 30)])
            .on("brush", function(){
                var LBrushExtend = LMe.brush.extent(),
                    LLowerDate = LBrushExtend[0],
                    LUpperDate = LBrushExtend[1];
                if(! LMe.brush.empty())
                {
                    var LX = d3.select(this).select(".extent").attr("x"),
                        LStr = LMe.owner.dateFormat(LLowerDate) + " to " + LMe.owner.dateFormat(LUpperDate);
                    LMe.rangeText
                        .text(LStr)
                        .attr("x", LX + "px");
                }
                else
                {
                    LMe.rangeText
                        .text('');
                }
            })
            .on('brushend', function () {
                if(! LMe.brush.empty())
                {
                    var LBrushExtend = LMe.brush.extent();
                    LMe.onTimeFilter(LBrushExtend);

                    //run function to update dots on map
                    LMe.countReports(LMe.owner.dateFormat(LBrushExtend[0]), LMe.owner.dateFormat(LBrushExtend[1]));
                }
                else
                {
                    LMe.onTimeFilter(LMe.dateExtent);
                }
                LMe.dataMiss.filter(function(m,i){
                    if(m.mission == G_FILTERS.openDoc){
                        G_FILTERS.openDocCount = m.currCount;
                    }
                    //console.log(m.currCount)
                });
            });

        d3.select('#xAxis')
            .call(LMe.brush)
            .selectAll('rect')
            .attr('y', -10)
            .attr('height', 40);

        LMe.svg.append("g")
            .attr("class", "x axis time-selector-axis")
            .attr("transform", "translate(" + 0 + "," + 25 + ")")
            .call(LMe.xAxis);

        var brushg = LMe.svg.append("g")
            .attr("class", "brush")
            //.attr("transform", "translate(" + LMe.margin.left + ",0)")
            .call(LMe.brush);

        //brushg.selectAll(".resize").append("path")
            //.attr("transform", "translate(0," +  LMe.timelineHeight / 6 + ")")
            //.attr("d", LMe.resizePath);

        brushg.selectAll("rect")
            .style("fill", "purple")
            .attr("height", 15)
            .attr("y", 18)
            .attr("x", 0);

        LMe.rangeText = LMe.svg.append("text")
            .style("fill", "white")
            .style("font-weight","lighter")
            .attr("class", "brush-range-text")
            .text("") //4-Jan-16 to 30-Jan-16
            .attr("y", "10px")
            ;

    };*/

    //---------------------------------------------------------------
    /*LMe.countReports = function(a, b){
        //console.log(LMe.dataMiss);
        
        LMe.dataMiss.forEach(function(m,i){
            m.prevCount = m.currCount;
            m.currCount = 0;
            LMe.data.forEach(function(r,i){
                if(r.mission == m.mission && LMe.owner.dateFormat.parse(r.date) >= LMe.owner.dateFormat.parse(a) && LMe.owner.dateFormat.parse(r.date) <= LMe.owner.dateFormat.parse(b) ){
                    m.currCount++; 
                }
            });
        });

//                    G_FILTERS.openDocCount = LMe.dataMiss(function(d){ if(d.mission = G_FILTERS.openDoc){console.log(d.currCount); return d.currCount}})

        //update sizes of circles as brush moves
        G_CIRCLES
            .transition().duration(500).attr("r", function(m){
              return m.currCount/2;
            })
        *//*    .transition().duration(500).style("fill",function(m){
                if(m.prevCount < m.currCount){
                    return "orange";
                } else{
                    return "purple";
                }
            });*//*
    };*/

    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}