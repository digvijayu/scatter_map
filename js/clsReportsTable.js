function clsReportsTable(p_Config){
    var LMe = this;

    //Render to
    LMe.renderTo  = "";
    LMe.height = 800;
    LMe.width = 800;

    LMe.tableDimenstion = null;
    LMe.tableGroup = null;

    LMe.metadata = [
        { name: "date", label: "DATE", datatype: "string" },
        { name: "mission", label: "MISSION", datatype: "string" },
        { name: "description", label: "DESCRIPTION", datatype: "string" }
    ];

    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.pagerContainer = d3.select("#" + LMe.pagerRenderTo);

        var LPagerConfig = {
            renderTo : LMe.pagerRenderTo,
            owner : LMe
        };
        LMe.pager = new clsPager(LPagerConfig);
    };

    //---------------------------------------------------------------
    LMe.drawDataTable = function(){
        var LData = LMe.owner.missionsDimension.top(Infinity);
        $("#" + LMe.renderTo).jqGrid({
            datatype: "local",
            data : [],
            colNames: [
                'DATE',
                'MISSION',
                'SOURCE',
//                'SUBJECT',
//                "tags",
                'DESCRIPTION'
            ],
            colModel: [
                {name: 'date', index: 'date', title: false, width: 70},
                {name: 'mission', index: 'mission',title: false, width: 70},
                {name: 'stakeholder', index: 'stakeholder',title: false, width: 70},
//                {name: 'subject', index: 'subject', width: 55},
//                {name: 'tags', index: 'tags', width: 150},
                {name: 'description', index: 'description',title: false, width: 600}
            ],
            gridview: true,
            rownumbers: false,
//            rowNum: LData.length,
            rowNum: 100,
//            rowList: [5, 10, 15],
//            pager: 'pager',
            sortname: 'orderdate',
            loadonce: false,
            viewrecords: true,
            sortorder: 'desc',
//            caption: 'Preserving Selection on Client-side sorting',
            height: (LMe.height - 50),
            onSelectRow: function() {
                return false;
            },
            beforeSelectRow: function() {
                return false;
            },
            onSortCol: function () {
                //saveSelectedRow.call(this);
            },
            loadComplete: function () {
                //selectSavedRow.call(this);
            }
        });

        LMe.pager.initialize(LData);
        LMe.loadTable(LData);
    };



    //---------------------------------------------------------------
    LMe.removeTable = function()
    {
        if(LMe.dataTable)
        {
            //Remove the data table
        }
    };

    //---------------------------------------------------------------
    LMe.drawTable = function()
    {
        //Remove the data table
        LMe.tableDimenstion = LMe.owner.missionsDimension;
        //LMe.tableDimenstion.filter(p_ForMission);
        LMe.drawDataTable();
    };

    //---------------------------------------------------------------
    LMe.refreshTable = function(){
        var LData = LMe.owner.missionsDimension.top(Infinity);
        LMe.pager.initialize(LData);
        LMe.loadTable(LData);
    };

    //---------------------------------------------------------------
    LMe.loadTable = function(p_Data){
        var LFromRecordIndex = LMe.pager.recordsPerPage * (LMe.pager.selectedPage - 1),
            LToRecordIndex = LMe.pager.recordsPerPage * LMe.pager.selectedPage - 1;
        var LTableData = [];
        for(var LLoopIndex = LFromRecordIndex; LLoopIndex <= LToRecordIndex; LLoopIndex++)
        {
            if(LLoopIndex >= p_Data.length)
            {
                break;
            }
            LTableData.push(p_Data[LLoopIndex]);
        }

        $("#" + LMe.renderTo).clearGridData();
        $("#" + LMe.renderTo).jqGrid('setGridParam',{data:LTableData}).trigger("reloadGrid")
    };

    //---------------------------------------------------------------
    LMe.handleOnPageChange = function(){
        var LData = LMe.owner.missionsDimension.top(Infinity);
        LMe.loadTable(LData);
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
