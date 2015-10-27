/**
 * Created with JetBrains WebStorm.
 * User: Digvijay.Upadhyay
 * Date: 12/18/13
 * Time: 12:48 PM
 * To change this template use File | Settings | File Templates.
 */

function clsPager(p_Config){
    var LMe = this;

    //Render to
    LMe.renderTo  = "";

    //No of records for each page
    LMe.recordsPerPage = 100;

    //Selected page
    LMe.selectedPage = 1;

    //the no of pages to be displayed at a time
    LMe.displayNoOfPages = 5;

    //page count
    LMe.pageCount = 1;


    //---------------------------------------------------------------
    LMe.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            LMe[p_Name] = LValue;
        }

        LMe.container = d3.select("#" + LMe.renderTo);
    };

    //---------------------------------------------------------------
    LMe.initialize = function(p_Data){
        var LCount = p_Data.length,
            LNoOfPages = Math.floor(LCount/LMe.recordsPerPage);

        if(LCount % LMe.recordsPerPage != 0)
        {
            LNoOfPages++;
        }

        LMe.pageCount = LNoOfPages;

        //reinitialize to first page
        LMe.selectedPage = 1;
        LMe.drawPages();

    };

    //---------------------------------------------------------------
    LMe.drawPages = function(){

        function L_FormatNewSpan(p_Span, d)
        {
            p_Span.datum(d)
                .attr("class", "pager-page-no")
                .on('click', LMe.handleOnPageChange);

            if(d == LMe.selectedPage)
            {
                //Highlight the selected page
                p_Span.classed("pager-page-no-selected", true);
            }
        }

        var LIsFirstPage = false,
            LIsLastPage = false,
            LNoOfPagesToTheLeft,
            LNoOfPagesToTheRight,
            LPageDataArr = [];

        if(LMe.selectedPage == 1)
        {
            LIsFirstPage = true;
        }
        else if(LMe.selectedPage == LMe.pageCount)
        {
            LIsLastPage = true;
        }

        //Remove previous pages
        LMe.container.selectAll("*").remove();

        var LDisplayNoOfPages = LMe.displayNoOfPages;
        if(LMe.pageCount < LMe.displayNoOfPages)
        {
            LDisplayNoOfPages = LMe.pageCount;
        }

        LNoOfPagesToTheLeft = Math.floor((LDisplayNoOfPages - 1) /2);
        LNoOfPagesToTheRight = LNoOfPagesToTheLeft;

        if(LMe.selectedPage <= LNoOfPagesToTheLeft)
        {
            var LDifference = (LNoOfPagesToTheLeft - LMe.selectedPage) + 1;
            LNoOfPagesToTheLeft = LNoOfPagesToTheLeft - LDifference;
            LNoOfPagesToTheRight += LDifference;
        }

        if((LMe.pageCount - LMe.selectedPage) <= LNoOfPagesToTheRight)
        {
            var LRDifference = (LNoOfPagesToTheRight - (LMe.pageCount - LMe.selectedPage));
            LNoOfPagesToTheRight -= LRDifference;
            LNoOfPagesToTheLeft += LRDifference;
        }

        //Add left page nos
        while(LNoOfPagesToTheLeft > 0)
        {
            LPageDataArr.push(LMe.selectedPage - LNoOfPagesToTheLeft);
            LNoOfPagesToTheLeft--;
        }

        //Add the selected page
        LPageDataArr.push(LMe.selectedPage);

        //Add right page nos
        var LCount = 1;
        while(LCount <= LNoOfPagesToTheRight)
        {
            LPageDataArr.push(LMe.selectedPage + LCount);
            LCount++;
        }

        if(! LIsFirstPage)
        {
            var LFirstSpan = LMe.container.append("span")
                .text("FIRST");

            L_FormatNewSpan(LFirstSpan, 1);
        }

        for(var LLoopIndex = 0; LLoopIndex < LPageDataArr.length; LLoopIndex++){
            var LData = LPageDataArr[LLoopIndex];
            var LSpan = LMe.container.append("span")
                .text(LData);
            L_FormatNewSpan(LSpan, LData);
        }

        if(! LIsLastPage)
        {
            var LLastSpan = LMe.container.append("span")
                .text("LAST");

            L_FormatNewSpan(LLastSpan, LMe.pageCount);
        }

        /*LMe.container..selectAll("span").data([]).exit().remove();
        LMe.container.selectAll("span").data(LPageDataArr)
            .enter()
            .append("span")*/
    };

    //---------------------------------------------------------------
    LMe.handleOnPageChange = function(d){
        //reinitialize to first page
        LMe.selectedPage = d;
        LMe.drawPages();
        LMe.owner.handleOnPageChange();
    };

    //---------------------------------------------------------------

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
