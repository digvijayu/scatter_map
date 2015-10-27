function clsSubjectSelector(p_Config){
    var LMe = this;

    //Render to
    LMe.renderTo  = "";

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

        var LSubjectsGroup = LMe.owner.subjectDimGroup;

        var LContainer = d3.select("#" + LMe.renderTo);

        var LList = LContainer.append("ul"),
            LSubjectsData = [];

        LMe.list = LList;

        var LSubjects = LSubjectsGroup.top(Infinity);

        //Traverse and create collection for subjects
        for(var LLoopIndex = 0; LLoopIndex < LSubjects.length; LLoopIndex++)
        {
            var LItem = LSubjects[LLoopIndex];
            var LGroupIndex = LItem.key,
                LGroupVal = LItem.value;

            var LSubjectDetails = LMe.getSubjectByIndex(LGroupIndex);
            var LSubject = {
                subjectIndex : LGroupIndex,
                subjectItemCount : LGroupVal,
                subjectCaption : LSubjectDetails.caption,
                subjectImg : LSubjectDetails.image,
                subjectHoverImg : LSubjectDetails["hover-image"],
                //Initially each subject is selected
                isSelected : true
            };
            LSubjectsData.push(LSubject);
        }

        var LDivs = LList.selectAll("li").data(LSubjectsData)
            .enter().append("li")
            .on('mouseover', function(d){
               /* var LImg = d3.select(this).select("img");
                LImg.attr("src", function(d){
                    return d.subjectHoverImg;
                })*/
            })
            .on('mouseout', function(d){
                /*if(d.isSelected)
                {
                    return;
                }
                var LImg = d3.select(this).select("img");
                LImg.attr("src", function(d){
                    return d.subjectImg;
                })*/
            })
            .on('click', LMe.handleOnSubjectClick)
            .append("div")
            .attr("class", function(d){
                var LClasses = '';
                if(d.isSelected)
                {
                    LClasses += "subject-item-selected ";
                }
                LClasses += "subject-item";
                return LClasses;
            });

        //add subject caption divs
        LDivs.append("div")
            .attr("class", "subject-caption")
            .text(function(d){
            return d.subjectCaption;
        });

        //Add image
        LDivs.append("div")
            .attr("class", "subject-img")
            .append("img")
            .attr("src",function(d){
                if(d.isSelected)
                {
                    return d.subjectHoverImg;
                }
                return d.subjectImg;
            });


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
    LMe.handleOnSubjectClick = function(d)
    {
        if(! d.isSelected)
        {
            //The item is not selected
            //Select the item
            d.isSelected = true;
            var LItemDiv = d3.select(this).select(".subject-item").classed("subject-item-selected", true);
            LItemDiv.select("img").attr("src",function(d){
                if(d.isSelected)
                {
                    return d.subjectHoverImg;
                }
                return d.subjectImg;
            });
            LMe.applyFilter();
            return;
        }

        //The item was already selected
        //Get no of items selected
        var LCount = 0,
            LTotalSubjectCount = 0;
        LMe.list.selectAll("li").each(function(d){
            LTotalSubjectCount++;
            if(d.isSelected) LCount++;
        });

        if(LCount > 1 && LCount < LTotalSubjectCount)
        {
            //More than this items are selected so we unselect the current item
            d.isSelected = false;
            var LItemDiv = d3.select(this).select(".subject-item").classed("subject-item-selected", false);
            LItemDiv.select("img").attr("src",function(d){
                if(d.isSelected)
                {
                    return d.subjectHoverImg;
                }
                return d.subjectImg;
            });
        }
        else if(LCount == LTotalSubjectCount)
        {
            LMe.list.selectAll("li").each(function(d1){
                if(d.subjectIndex == d1.subjectIndex)
                {
                    //The clicked item
                    //Skip the cliked item
                    return;
                }
                d1.isSelected = false;
                var LItemDiv = d3.select(this).select(".subject-item").classed("subject-item-selected", false);
                LItemDiv.select("img").attr("src",function(d){
                    if(d1.isSelected)
                    {
                        return d.subjectHoverImg;
                    }
                    return d.subjectImg;
                });
            });
        }
        else
        {
            //Only the clicked item is selected
            //All items can not be deselected so we select all items
            LMe.list.selectAll("li").each(function(d){
                d.isSelected = true;
                var LItemDiv = d3.select(this).select(".subject-item").classed("subject-item-selected", true);
                LItemDiv.select("img").attr("src",function(d){
                    if(d.isSelected)
                    {
                        return d.subjectHoverImg;
                    }
                    return d.subjectImg;
                });
            });
        }
        LMe.applyFilter();
    };

    //---------------------------------------------------------------
    LMe.applyFilter = function(d)
    {
        var LSelectedItems = [];
        LMe.list.selectAll("li").each(function(d){
            if(d.isSelected)
                LSelectedItems.push(d.subjectIndex);
        });

        LMe.owner.subjectDimension.filter(function(d){
            for(var LLoopIndex = 0; LLoopIndex < LSelectedItems.length; LLoopIndex++)
            {
                if(d == LSelectedItems[LLoopIndex])
                {
                    return true;
                }
            }
            return false;
        });
        LMe.owner.handleOnFiltered();
    };

    //---------------------------------------------------------------
    LMe.getSubjectByIndex = function(p_Index)
    {
        var LItem = G_SUBJECTS[p_Index];
        return LItem;
    };

    //---------------------------------------------------------------
    LMe.reset = function(){
        //All items can not be deselected so we select all items
        LMe.list.selectAll("li").each(function(d){
            d.isSelected = true;
            var LItemDiv = d3.select(this).select(".subject-item").classed("subject-item-selected", true);
            LItemDiv.select("img").attr("src",function(d){
                if(d.isSelected)
                {
                    return d.subjectHoverImg;
                }
                return d.subjectImg;
            });
        });
        LMe.applyFilter();
    };

    //---------------------------------------------------------------
    //construct the object and return the new object
    LMe.constructor(p_Config);
    return LMe;
}
