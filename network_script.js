var widthSVG = d3.select("#svg").node().clientWidth;
var heightSVG = 650;//d3.select("#svg").node().clientHeight;

var svg = d3.select("#svg")
    .append("svg")
    .attr("width", widthSVG)
    .attr("height", heightSVG);

svg.append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("width", widthSVG)
    .attr("height", heightSVG)
    .attr("rx", 10)
    .attr("ry", 10);

var nodeColor = ["#a86464","#BA966B","#597031","#A1941D","#764E2C","#83609b","#3F7F60"];

var queue = d3.queue()
    .defer(d3.csv, "data/refugees_5_largest.csv", parseRefugees)
    .defer(d3.csv, "data/nodes.csv", function(d){return{id: d.ID, group: d.group}})
    .defer(d3.csv, "data/government_stability.csv", parseStability)
    .await(network);

function network(error, data, nodes, stability){
    if(error) throw error;
    //default visualization settings
    var year = 2016;
    var indexPol = "Political Stability and Absence of Violence/Terrorism: Estimate";
    var numRefugees = 500
    //var maxRefugees = d3.max(data, function(d){return d.refugee});
    
    //buttons to customize network
    d3.selectAll(".btnYear").on("click", function(){
        year = +this.getAttribute("id");
        draw(year, indexPol, numRefugees);
    });
    
    d3.selectAll(".btnPol").on("click", function(){
        indexPol = this.getAttribute("id");
        draw(year, indexPol, numRefugees);
    });
    
    d3.select(".form-control").on("input", function(){
        numRefugees = this.value;
        if(numRefugees>0)
            draw(year, indexPol, numRefugees);
    });
    
    //initialize sim
    var simulation = d3.forceSimulation()
        //.velocityDecay(.6)
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("center", d3.forceCenter(widthSVG/2, heightSVG/2))
        .force("charge", d3.forceManyBody().strength(-120));
    //initial view
    draw(year, indexPol, numRefugees);
    
    //draws the network anytime a setting is changed
    function draw(year, indexPol, numRefugees){
        //restart simulation to draw updated data
        d3.selectAll(".node").remove();
        d3.selectAll(".link").remove();
        d3.selectAll(".label").remove();
        simulation.alpha(1).restart();
        
        //filter based on political index
        var stable = stability.filter(function(d){
        return(d.indicator == indexPol)});
        //switch case filter only data corresponding to the year
        for(var i=0; i<stable.length; i++){
            switch(year){
                case 2012: 
                    stable[i]={
                    id: stable[i].id,
                    value: stable[i].val12,
                    indicator: stable[i].indicator
                    };
                    break;
                case 2013: 
                    stable[i]={
                    id: stable[i].id,
                    value: stable[i].val13,
                    indicator: stable[i].indicator
                    };
                    break;
                case 2014: 
                    stable[i]={
                    id: stable[i].id,
                    value: stable[i].val14,
                    indicator: stable[i].indicator
                    };
                    break;
                case 2015: 
                    stable[i]={
                    id: stable[i].id,
                    value: stable[i].val15,
                    indicator: stable[i].indicator
                    };
                    break;
                case 2016: 
                    stable[i]={
                    id: stable[i].id,
                    value: stable[i].val16,
                    indicator: stable[i].indicator
                    };
                    break;
            }
        }
        
        //filter links on year and number of refugees
        var links = data.filter(function(d){return (d.year == year && d.refugee>=numRefugees)});
        
        //modified from https://bl.ocks.org/mbostock/4062045
        var link = svg.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "grey")
            .attr("stroke-width", function(d){return Math.sqrt(Math.sqrt(d.refugee/1000))});
        link.exit().remove();
        
        var node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("fill", function(d){return nodeColor[d.group-1]})
            .attr("r", function(d){
                if(d.id == "Afghanistan" || d.id == "Nigeria" || d.id == "Syrian Arab Rep." || d.id == "Somalia" || d.id == "South Sudan")
                    return 7;
                else return 4;
            });
        node.exit().remove();
        
        var labels = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .text(function(d){
                if(d.id == "Afghanistan" || d.id == "Nigeria" || d.id == "Syrian Arab Rep." || d.id == "Somalia" || d.id == "South Sudan")
                    return d.id;
                });
        labels.exit().remove();
        
        node.append("title")
            .text(function(d) { return d.id; });
        //end section

        //add nodes
        simulation.nodes(nodes)
            .on("tick", ticked);
        
        //link strength based on num refugees and political indicators
        //polSource + polSink, prob needs array index oob throw
        simulation.force("link").links(links).strength(function(d, i){
            var sourceVal = 0;
            var targetVal = 0;
            var foundS = false;
            var foundT = false;
            var i = 0;
            while(i<stable.length && !(foundS && foundT)){
                if(stable[i].id == d.source.id){
                    sourceVal = stable[i].value;
                    foundS = true;
                }
                if(stable[i].id == d.target.id){
                    targetVal = stable[i].value;
                    foundT = true;
                }
                i++;
            }
            return 1-Math.abs((targetVal+sourceVal))/6;
            //strengthScale(d.refugee);
        });

        
        //modified from https://bl.ocks.org/mbostock/4062045
        function ticked(){
        link
            .attr("x1", function(d) {return d.source.x})
            .attr("y1", function(d) {return d.source.y})
            .attr("x2", function(d) {return d.target.x})
            .attr("y2", function(d) {return d.target.y});

        nodes[0].x = widthSVG/2;
        nodes[0].y = heightSVG/2;
        
        node
            .attr("cx", function(d) {return d.x})
            .attr("cy", function(d) {return d.y});
            
        labels
            .attr("x", function(d) {return 10+d.x})
            .attr("y", function(d) {return d.y});
        }
        //end section
        
        svg.selectAll("g").call(d3.drag()
            .on("drag", dragged));
        
        //modified from https://bl.ocks.org/mbostock/22994cc97fefaeede0d861e6815a847e
        function dragged(d){
            simulation.stop();
            link
                .attr("x1", function(d){return d.source.x})
                .attr("y1", function(d){return d.source.y})
                .attr("x2", function(d){return d.target.x})
                .attr("y2", function(d){return d.target.y});
            
            node
                .attr("cx", function(d){d.x += d3.event.dx;
                                        return d.x})
                .attr("cy", function(d){d.y += d3.event.dy;
                                        return d.y});
            labels
                .attr("x", function(d){d.x += d3.event.dx;
                                       return d.x+10})
                .attr("y", function(d){d.y += d3.event.dy;
                                       return d.y + d3.event.dy});
        }
        //end section
        
        var info = svg.append("g");
        info.append("text")
            .attr("class", "label")
            .attr("x", 10)
            .attr("y", 20)
            .text("Year: "+year);
        if(indexPol=="Political Stability and Absence of Violence/Terrorism: Estimate")
            indexPol="Political Stability: Estimate";
        info.append("text")
            .attr("class", "label")
            .attr("x", 10)
            .attr("y", 40)
            .text("Index: "+indexPol);
    }  
}

function parseRefugees(d){
    return{
        target: d.Destination,
        source: d.Origin,
        year: d.Year,
        refugee: +d.Refugees,
        asylum: +d.AsylumSeekers
    }
}

function parseStability(d){
    return{
        id: d.CountryName,
        val12: +d[2012],
        val13: +d[2013],
        val14: +d[2014],
        val15: +d[2015],
        val16: +d[2016],
        indicator: d.SeriesName,
    }
}

//Legend//
var widthLegend = d3.select("#leg-div").node().clientWidth;
var heightLegend = widthLegend;

var legend = d3.select("#legend")
    .append("svg")
    .attr("width", widthLegend)
    .attr("height", heightLegend);

//var color = ["orange","red","green","yellow","brown","purple","blue"];
var region = ["North America & Europe","Central/South America","Sub-Saharan Africa","Former USSR","Middle East & North Africa","East Asia","Oceania"];

for(var i=0; i<nodeColor.length; i++){
    var item = legend.append("g")
        .attr("transform", "translate(8,"+((i*25)+10)+")");
    item.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", nodeColor[i])
        .attr("stroke", "black");
    item.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .text(region[i]);
}

for(var i=10; i<=100000; i*=10){
    var item = legend.append("g")
        .attr("transform", "translate(0,"+((Math.log10(i)*25)+160)+")");
    item.append("line")
        .attr("stroke", "grey")
        .attr("stroke-width", Math.sqrt(Math.sqrt(i/1000)))
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 40)
        .attr("y2", 0);
    item.append("text")
        .attr("x", 45)
        .attr("y", 5)
        .text(i+" Refugees");
}
