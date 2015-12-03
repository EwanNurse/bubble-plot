d3.json("nations.json", function(nation){
    var region_names = ["Sub-Saharan Africa", "South Asia", "Middle East & North Africa", "America", "East Asia & Pacific", "Europe & Central Asia"];

    var filtered_nations = nation.map(function(nation) { return nation; });
    var year_idx = parseInt(document.getElementById("year_slider").value)-1950;
    
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")  
    .style("visibility", "hidden");
    
    
    
    var chart_area = d3.select("#chart_area");
    var svg = chart_area.append("svg");
    var canvas = svg.append("g");
    
    var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
    var svg_width = 960;
    var svg_height = 350;
    var canvas_width = svg_width - margin.left - margin.right;
    var canvas_height = svg_height - margin.top - margin.bottom;
    svg.attr("width", svg_width);
    svg.attr("height", svg_height);
    
    canvas.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var xScale = d3.scale.log();
    var yScale = d3.scale.linear();
    var circScale = d3.scale.sqrt();
    var colorScale = d3.scale.category20();

    
    xScale.domain([250, 1e5]);
    xScale.range([0, canvas_width]);
    
    yScale.domain([10, 85]);
    yScale.range([canvas_height, 0]);
    
    circScale.domain([0, 5e8]);
    circScale.range([0, 40]);
    
    var xAxis = d3.svg.axis().orient("bottom").scale(xScale);
    var yAxis = d3.svg.axis().orient("left").scale(yScale);
    
    canvas.append("g")
          .attr("class","x axis")
          .attr("transform", "translate(0," + canvas_height + ")")
          .call(xAxis);
    canvas.append("g")     
          .attr("class","y axis")
          .call(yAxis);
          
    var data_canvas = canvas.append("g")
                            .attr("class", "data_canvas");

            // Calculate the averages for each region.
    

    var region_data = [];
    for (var i in region_names) {
        var filtered_nations_by_regions = nation.filter(function(nation){
            return (nation.region == region_names[i]); 
    });
        region_data[i] = calc_mean(filtered_nations_by_regions);
    }

    var filtered_reg_nations = region_data.map(function(region) { return region;});
    
    function calc_mean(region_data) {
    var mean_income = [];
    var mean_lifeExpectancy = [];

    for (var year_idx2 in region_data[0].years) {
        var sum_income = 0;
        var sum_lifeExpectancy = 0;
        var sum_population = 0;

        for (var k in region_data) {
            var kpop = region_data[k].population[year_idx2];
            var kincome = region_data[k].income[year_idx2];
            var klife = region_data[k].lifeExpectancy[year_idx2];
            sum_income += kpop*kincome; 
            sum_lifeExpectancy += kpop*klife;
            sum_population += kpop;             
        }

        mean_income[year_idx2] = sum_income/sum_population;
        mean_lifeExpectancy[year_idx2] = sum_lifeExpectancy/sum_population;
    }
    averageData = {
        region: region_data[0].region,
        years: region_data[0].years,
        mean_income: mean_income,
        mean_lifeExpectancy: mean_lifeExpectancy
    };

    return averageData;
}                            
    function update() {
        var dot = data_canvas.selectAll(".dot").data(filtered_nations, function(d){return d.name});

        dot.enter().append("circle").attr("class","dot")                        
            .style("fill", function(d) { return colorScale(d.region); })
            .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.name);})
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
        dot.exit().remove();
        
        dot.transition().ease("linear").duration(200)
                    .attr("cx", function(d) { return xScale(d.income[year_idx]); }) // this is how attr knows to work with the data
                    .attr("cy", function(d) { return yScale(d.lifeExpectancy[year_idx]); })
                    .attr("r", function(d) { return circScale(d.population[year_idx]); });
                    
        var cross = data_canvas.selectAll(".cross").data(filtered_reg_nations, function(d) {return d.region});
        cross.enter().append("rect").attr("class","cross").attr("width", '10px').attr("height", '10px').attr('stroke-width', '4px')                       
            .style("fill", function(d) { return colorScale(d.region); })
            .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.name);})
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
        cross.exit().remove();
        
        cross.transition().ease("linear").duration(200)
                    .attr("x", function(d) { return xScale(d.mean_income[year_idx]); }) // this is how attr knows to work with the data
                    .attr("y", function(d) { return yScale(d.mean_lifeExpectancy[year_idx]); })
    }
    update();

    d3.selectAll(".region_cb").on("change", function() {
        var type = this.value;
        if (this.checked) { // adding data points
            var new_nations = nation.filter(function(nation){ return nation.region == type;});
            filtered_nations = filtered_nations.concat(new_nations);
            var new_regions = region_data.filter(function(region_data){ return region_data.region == type;});
            filtered_reg_nations = filtered_reg_nations.concat(new_regions);
        } else { // remove data points from the data that match the filter
            filtered_nations = filtered_nations.filter(function(nation){ return nation.region != type;});
            filtered_reg_nations = filtered_reg_nations.filter(function(region_data){ return region_data.region != type;});
    }
    update();
    });
    
    d3.select("#year_slider").on("input", function () {
    year_idx = parseInt(this.value) - 1950;
    update();
    });
});

