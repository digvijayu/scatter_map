function clsSourceSelector(p_Config){
    var LMe = this;

    //Render to
    LMe.renderTo  = "";

    LMe.height = 180;
    LMe.width = 180;
    LMe.radius = 80;
    LMe.innerRadius = 30;
    LMe.renderTo = "";

    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

    };

    //---------------------------------------------------------------
    LMe.drawChart = function(){
        //draw row chart for subjects
        LMe.sourceChart = dc.pieChart("#" + LMe.renderTo);
        LMe.sourceChart.width(LMe.width)
            .dimension(LMe.owner.sourceDimension)
            .group(LMe.owner.sourceDimGroup)
            .height(LMe.height)
            .radius(LMe.radius)
            .innerRadius(LMe.innerRadius)
            .legend(dc.legend().x(0).y(0).itemHeight(13).gap(5));

        LMe.sourceChart.on("filtered", function(chart, filter){
            LMe.updateFilterCount();
            LMe.owner.handleOnFiltered();
        });

        LMe.sourceChart.on("postRender", function(chart){
            LMe.updateFilterCount();
        });

        LMe.sourceChart.render();
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
        LMe.sourceChart.filterAll();
        LMe.sourceChart.redraw();
    };

    //---------------------------------------------------------------
    LMe.updateFilterCount = function(){
        var LSpan = d3.select("#" + LMe.displayCountInElId),
            LHasFilter = LMe.sourceChart.hasFilter(),
            LFilterValues = LMe.sourceChart.filters();

        if(LHasFilter)
        {
            //Some filter is there
            var LValue = "(" + LFilterValues.length + ")";
            LSpan.text(LValue);
            return;
        }

        //There is no filter selected hence al the filters must have been used
        //Some filter is there
        var LValue = "(" + LMe.owner.sourceDimGroup.size() + ")";
        LSpan.text(LValue);
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
