function clsTagsSelector(p_Config){
    var LMe = this;

    LMe.tagsList = [];

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
    LMe.initialize = function(){
        LMe.list = LMe.container.append("ul");

        var LI = LMe.list.append("li");
        LMe.addNewTagEdt = LI.append('input')
            .attr("class", "new-keyword-edt")
            .attr("id", "addNewKeywordEdt")
            .on("keypress", function(e){
                if (d3.event.keyCode == 13) {
                    LMe.addNewKeywordToList();
                }
            });

        LMe.addNewKeywordBtn = LI.append('div')
            .attr("id", "addNewKeywordBtn")
            .attr("class", "new-keyword-btn")
            .text("+")
            .on("click", LMe.addNewKeywordToList);

        //Add the tags to a newline
        LMe.list.append("br");

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
    LMe.removeTagFromList = function(p_tag, p_LI){
        var index = LMe.tagsList.indexOf(p_tag);    // <-- Not supported in <IE9
        if (index !== -1) {
            LMe.tagsList.splice(index, 1);
        }
        p_LI.remove();
        //Refresh the filter
        LMe.refreshFilter();
    };

    //---------------------------------------------------------------
    LMe.addNewTagToVisualList = function(p_tag){
        var LI = LMe.list.append("li")
            .attr("class", "tag-li");

        //Get total occurances of keyword
        var LTagDiv = LI.append('div')
            .attr('class', "keyword-vis")
            .datum(p_tag);
            //.on('mouseover', LMe.HandleOnMouseHover)
            //.on('mouseout', LMe.HandleOnMouseOut)
            //.on('click', LMe.HandleOnWordClick);

        LTagDiv.append("span")
            .text(p_tag);

        LTagDiv.append("span")
            .attr('class', 'rem-keyword')
            .text('x')
            .on('click', function(){
                LMe.removeTagFromList(p_tag, LI);
            });
    };

    //---------------------------------------------------------------
    LMe.addNewKeywordToList = function(){
        //alert('added a new keyword');
        var LNewTag = LMe.addNewTagEdt[0][0].value;
        LNewTag = LNewTag.trim();

        if(LNewTag == "")
        {
            alert('Please enter a tag');
            return;
        }

        //Check if the keyword is already in the list
        for(var LLoopIndex=0; LLoopIndex < LMe.tagsList.length; LLoopIndex++){
            var LTag = LMe.tagsList[LLoopIndex];
            if(LNewTag.toUpperCase() == LTag.toUpperCase())
            {
                //The entered keyword already exists can not add it
                alert('The keyword entered by you is already selected.');
                return;
            }
        }
        LMe.tagsList.push(LNewTag);
        LMe.addNewTagToVisualList(LNewTag);
        LMe.addNewTagEdt[0][0].value = '';

        //Refresh the filter
        LMe.refreshFilter();
    };

    //---------------------------------------------------------------
    LMe.refreshFilter = function(){

        if(LMe.tagsList.length < 1)
        {
            //There are no tags selected
            //Clear the filter
            LMe.owner.tagsDimension.filterAll();
            //Update owner that filter has been changed
            LMe.owner.handleOnFiltered();
            return;
        }

        LMe.owner.tagsDimension.filter(function(d){
            var LTagsArray = d.split(','),
                LSelectedTags = LMe.tagsList;
            for(var LLoopIndex = 0; LLoopIndex < LSelectedTags.length; LLoopIndex++)
            {
                var LTag = LSelectedTags[LLoopIndex];
                if(LTagsArray.indexOf(LTag) > -1)
                {
                    return true;
                }
            }

            return false;
        });
        LMe.owner.handleOnFiltered();
    };

    //---------------------------------------------------------------
    LMe.reset = function(){
        //remove UI tags
        LMe.list.selectAll(".tag-li").remove();
        //remove tags from internal list
        LMe.tagsList = [];
        //Refresh the filter
        LMe.refreshFilter();
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
