function clsVisualizationMgr(p_Config){
    var LMe = this;

    LMe.dateFormat = d3.time.format("%e-%b-%y");

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
    LMe.prepareData = function(){
        //add field for the subject name
        var LLen = G_ChartData.reports.length;
        for(var LLoopIndex = 0; LLoopIndex < LLen; LLoopIndex++)
        {
            var LObj = G_ChartData.reports[LLoopIndex];
            LObj.dd = LMe.dateFormat.parse(LObj.date);
            LObj.month = d3.time.month(LObj.dd);
//            LObj.subjectName = G_SUBJECTS[LObj.subject];
        }

        LMe.dateExtent = d3.extent(G_ChartData.reports.map(function(d) { return LObj.dd; }));

        //The function will create data for charts
        LMe.filteredReports = crossfilter(G_ChartData.reports);

        //create dimension for date
        LMe.dateDimension = LMe.filteredReports.dimension(function(d){ return d.date; });
        LMe.dateDimGroup = LMe.dateDimension.group();

        LMe.monthDimenstion = LMe.filteredReports.dimension(function(d){ return d.month; });
        LMe.monthDimGroup = LMe.monthDimenstion.group();

        //dimension for subject
        LMe.subjectDimension = LMe.filteredReports.dimension(function(d){ return d.subject; });
        LMe.subjectDimGroup = LMe.subjectDimension.group();

        //mission subject
        LMe.missionsDimension = LMe.filteredReports.dimension(function(d){ return d.mission; });
        LMe.missionsDimGroup = LMe.missionsDimension.group();

        //mission subject
        LMe.tagsDimension = LMe.filteredReports.dimension(function(d){ return d.tags; });
        //LMe.tagsDimGroup = LMe.tagsDimension.group();

        //Source dimesion
        LMe.sourceDimension = LMe.filteredReports.dimension(function(d){ return d.stakeholder; });
        LMe.sourceDimGroup = LMe.sourceDimension.group();

        //index dimension
        LMe.idDimension = LMe.filteredReports.dimension(function(d){ return d.id; });
    };

    //---------------------------------------------------------------
    LMe.createMap = function(){
        var LConfig = {
            owner : LMe,
            renderTo : "map-container",
            zoomInBtn : "zoom-in-map-btn",
            zoomOutBtn : "zoom-out-map-btn"
        };
        LMe.map = new clsMap(LConfig);
        LMe.map.drawMap();
        LMe.map.refreshData();
    };

    //---------------------------------------------------------------
    LMe.createTimeSelector = function(){
        //Create the time selector
        var LTimeSelectorConfig = {
            height : 50,
            width : 200,
            renderTo : 'time-filter-scale',
            resetBtnId : 'date-range-reset',
            owner : LMe,
            onTimeFilter : function(p_dateExtent){
                //G_FILTERS.dateFilter = p_dateExtent;
                //L_getReports();
                //L_FilterScatterChart();
            }
        };
        LMe.timeSelector = new clsTimeSelector(LTimeSelectorConfig);
        LMe.timeSelector.drawChart();
    };

    //---------------------------------------------------------------
    LMe.createMissionsSelector = function(){
        var LConfig = {
            height : 650,
            width : 200,
            containerId : 'mission-selector-cntnr',
            resetBtnId : 'missions-reset',
            sortByNameBtnId : 'mission-sort-by-name',
            sortByCountBtnId : 'mission-sort-by-count',
            displayCountInElId : 'selected-missions-count',
            data : G_ChartData.reports,
            dataMiss : G_ChartData.missions,
            owner : LMe,
            onMissionFilter : function(p_selectedMissions, p_dateExtent){
                G_FILTERS.missionFilter = p_selectedMissions;
                L_FilterScatterChart();
            }
        };
        LMe.missionSelector = new clsMissionSelector(LConfig);
    };

    //---------------------------------------------------------------
    LMe.createSubjectSelector = function(){
        var LConfig = {
            height : 200,
            width : 200,
            renderTo: "subjects-filter",
            resetBtnId : 'subject-reset',

//            renderTo: "subject-selector-cntnr",
            owner : LMe
        };
        LMe.subjectSelector = new clsSubjectSelector(LConfig);
        LMe.subjectSelector.drawChart();
    };

    //---------------------------------------------------------------
    LMe.createReportsTable = function(){
        var LConfig = {
            renderTo: "reports-data-tbl",
            pagerRenderTo : "data-tbl-pager",
            owner : LMe,
            height : 400
        };
        LMe.reportsTable = new clsReportsTable(LConfig);
        LMe.reportsTable.drawTable();

        //By default display reports table collapsed
        $('#collapsible-reports-el').slideToggle(300);
        $('#expand-collapse-btn').html(G_MSG.CollapseReportsTable);

        //Bind the collapse and expand behaviour
        d3.select("#reports-tbl-header").on('click', function(){
            if($('#expand-collapse-btn').hasClass('expanded'))
            {
                //The tab was expanded
                $('#expand-collapse-btn').removeClass('expanded');
                $('#expand-collapse-btn').html(G_MSG.CollapseReportsTable);
            }
            else
            {
                //was collapsed
                $('#expand-collapse-btn').addClass('expanded');
                $('#expand-collapse-btn').html(G_MSG.ExpandReportsTable);
            }

            $('#collapsible-reports-el').slideToggle(300);
        });
    };

    //---------------------------------------------------------------
    LMe.createSourceSelector = function(){
        var LConfig = {
            height : 110,
            width : 200,
            radius : 50,
            innerRadius : 10,
            renderTo: "source-filter-cntnr",
            resetBtnId : 'source-filter-reset',
            displayCountInElId : 'selected-source-count',
            owner : LMe
        };
        LMe.sourceSelector = new clsSourceSelector(LConfig);
        LMe.sourceSelector.drawChart();
    };

    //---------------------------------------------------------------
    LMe.createTagFilter = function(){
        var LConfig = {
            renderTo: "tags-filter-cntnr",
            resetBtnId : 'tag-search-reset',
            owner : LMe
        };
        LMe.tagsSelector = new clsTagsSelector(LConfig);
        LMe.tagsSelector.initialize();
    };

    //---------------------------------------------------------------
    LMe.HandleMissionBubbleClick = function(p_Data, p_Circle)
    {
        LMe.filterMissions(p_Data.key);
    };

    //---------------------------------------------------------------
    LMe.handleOnFiltered = function(){
        //Filter has been updated refresh the table
        LMe.reportsTable.refreshTable();
        LMe.timeSelector.chart.redraw();
        LMe.missionSelector.rowChart.redraw();
        LMe.sourceSelector.sourceChart.redraw();
        LMe.map.updateCircles();
    };

    //---------------------------------------------------------------
    LMe.filterMissions = function(p_FilterValue){
        LMe.missionSelector.filter(p_FilterValue);
    };

    //---------------------------------------------------------------
    LMe.handleOnMissionFilter = function(){
        var p_HasFilter = LMe.missionSelector.rowChart.hasFilter(),
            p_FilterValues = LMe.missionSelector.rowChart.filters();
        LMe.map.syncSelectedMissions(p_HasFilter, p_FilterValues);
    };

    //---------------------------------------------------------------


    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
