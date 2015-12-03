d3.json("nations.json", function(nation){
    var filtered_nations = nation.map(function(nation) { return nation; });
    
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
                            
    var dot = data_canvas.selectAll(".dot")
                         .data(nation, function(d){return d.name});
    
    function update() {
        var dot = data_canvas.selectAll(".dot").data(filtered_nations, function(d){return d.name});

        dot.enter().append("circle").attr("class","dot")                
                .style("fill", function(d) { return colorScale(d.region); })
                .attr("cx", function(d) { return xScale(d.income[d.income.length-1]); }) // this is how attr knows to work with the data
                .attr("cy", function(d) { return yScale(d.lifeExpectancy[d.lifeExpectancy.length-1]); })
                .attr("r", function(d) { return circScale(d.population[d.population.length-1]); });

        dot.exit().remove();
    }
           
    //var filtered_nation = nation.filter( function(d){
    //    return d.region == "Sub-Saharan Africa" ;
    //});
    update();
    d3.selectAll(".region_cb").on("change", function() {
        var type = this.value;
        if (this.checked) { // adding data points (not quite right yet)
            var new_nations = nation.filter(function(nation){ return nation.region == type;});
            filtered_nations = filtered_nations.concat(new_nations);
        } else { // remove data points from the data that match the filter
            filtered_nations = filtered_nations.filter(function(nation){ return nation.region != type;});
    }
  update();
});
});

