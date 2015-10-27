//To generate the time line we need to know which are the documents which contain the words
//And after that we need to get how many occurances are there
//In order to generate the time line we need the minimum and maximum time
//So we have to load the data file json

/*
 * 1. Get which documents have the words
 * 2. Get the occurances in each document
 * 3. Draw the graph*
 */

function clsMissionSelector(p_Config){
    var LMe = this;

    LMe.svgId = "mission-selector";

    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.rowChart = dc.rowChart("#" + LMe.containerId);

        //Prepare the data
        LMe.prepareData();

        //Draw the chart
        LMe.drawChart();
    };


    //---------------------------------------------------------------
    LMe.drawButtons = function(){

    };


    //---------------------------------------------------------------
    LMe.prepareData = function(){
    };

    //---------------------------------------------------------------
    LMe.drawChart = function(){
        LMe.rowChart.width(LMe.width)
            .height(LMe.height)
            .dimension(LMe.owner.missionsDimension)
            .group(LMe.owner.missionsDimGroup)
            .renderLabel(true)
            .title(function (d) {
                return d.value;
            })
            .margins({top: 10, left: 10, right: 10, bottom: 20})
            //.brushOn(true)
            .ordinalColors(['#F7931E'])
            .label(function (d) {
                return d.key + " " + "(" + d.value + ")";
            })
            .ordering(function(d){
                return 1- d.value
            })
            .renderlet(function(chart){
                chart.selectAll(".dc-chart g.row")
                .on("mouseover", function(d){
                    //console.log(d.key);
                })
                .on("click", function(d){
                    //console.log("i clicked");
                    /*if(currFilters.length){
                        LMe.onMissionFilter(currFilters);                
                    } else{
                        LMe.onMissionFilter(allFilters);                
                    }*/
                });
            })
            .labelOffsetY(10)
            .labelOffsetX(3)
            .elasticX(true)
            .xAxis()
            .ticks(4);


        var allFilters = [];
        var currFilters=[];
        LMe.dataMiss.forEach(function(d){ 
            allFilters.splice(1,0,d.mission);
        });

        LMe.rowChart.filterPrinter(function(p_filters){
            currFilters = p_filters;
            //console.log(currFilters + " name")
        });

        LMe.rowChart.on("filtered", function (chart, filter) {
            dc.events.trigger(function () {
                //LMe.rowChart.filter(chart.filter());
            });
        });

        //dc.renderAll();
        LMe.rowChart.on("filtered", function(chart, filter){
            //update the filter count
            LMe.updateFilterCount();

            LMe.owner.handleOnMissionFilter();
            LMe.owner.handleOnFiltered();
        });
        LMe.rowChart.render();

        LMe.rowChart.on("postRender", function(chart){
            LMe.sortByRecordCount();
            LMe.updateFilterCount();
        });

        if(LMe.sortByNameBtnId)
        {
            d3.select("#" + LMe.sortByNameBtnId).on('click', function(){
                LMe.sortByName();
            });
        }

        if(LMe.sortByCountBtnId)
        {
            d3.select("#" + LMe.sortByCountBtnId).on('click', function(){
                LMe.sortByRecordCount();
            });
        }

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
    LMe.updateFilterCount = function(){
        var LSpan = d3.select("#" + LMe.displayCountInElId),
            LHasFilter = LMe.rowChart.hasFilter(),
            LFilterValues = LMe.rowChart.filters();

        if(LHasFilter)
        {
            //Some filter is there
            var LValue = "(" + LFilterValues.length + ")";
            LSpan.text(LValue);
            return;
        }

        //There is no filter selected hence al the filters must have been used
        //Some filter is there
        var LValue = "(" + LMe.owner.missionsDimGroup.size() + ")";
        LSpan.text(LValue);
    };

    //---------------------------------------------------------------
    LMe.filter = function(p_FilterValue){
        //Filter the graph
        LMe.rowChart.filter(p_FilterValue);
        //redraw the chart
        LMe.rowChart.redraw();

    };

    //---------------------------------------------------------------
    LMe.sortByRecordCount = function(){
        LMe.rowChart.ordering(function(d){
            return 1/d.value;
        });
        LMe.rowChart.redraw();

        if(LMe.sortByNameBtnId)
            d3.select("#" + LMe.sortByNameBtnId).classed("filter-btn-selected", false);

        if(LMe.sortByCountBtnId)
            d3.select("#" + LMe.sortByCountBtnId).classed("filter-btn-selected", true);
    };

    //---------------------------------------------------------------
    LMe.sortByName = function(){
        LMe.rowChart.ordering(function(d){
            return d.key;
        });
        LMe.rowChart.redraw();
        if(LMe.sortByNameBtnId)
            d3.select("#" + LMe.sortByNameBtnId).classed("filter-btn-selected", true);

        if(LMe.sortByCountBtnId)
            d3.select("#" + LMe.sortByCountBtnId).classed("filter-btn-selected", false);
    };

    //---------------------------------------------------------------
    LMe.reset = function(){
        //Clear filters
        LMe.rowChart.filterAll();
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}