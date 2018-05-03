var width = d3.select("#svg").node().clientWidth;
var height = d3.select("#svg").node().clientHeight;

var svg = d3.select("#svg")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var queue = d3.queue()
    .defer(d3.csv, "data/refugees_5_largest.csv", parseRefugees)
    .defer(d3.csv, "data/nodes.csv", function(d){return{id: d.ID}})
    .defer(d3.csv, "data/government_stability.csv", parseStability)
    .await(network);

function network(error, data, nodes, stability){
    if(error) throw error;
    
    //default visualization settings
    var year = 2016;
    var indexPol = "Political Stability and Absence of Violence/Terrorism: Estimate";
    var numRefugees = 500
    //var maxRefugees = d3.max(data, function(d){return d.refugee});
    //console.log(maxRefugees);
    
    //buttons to customize network
    d3.selectAll(".btnYear").on("click", function(){
        year = +this.getAttribute("id");
        draw(year, indexPol, numRefugees);
    });
    
    d3.selectAll(".btnPol").on("click", function(){
        indexPol = this.getAttribute("id");
        draw(year, indexPol, numRefugees);
    });
    
    //this is a lil borked
    /*d3.select(".form-control").on("input", function(){
        numRefugees = this.value;
        if(numRefugees>0)
            draw(year, indexPol, numRefugees);
    });*/
    
    //initialize sim
    var simulation = d3.forceSimulation()
        //.velocityDecay(.6)
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("center", d3.forceCenter(width/2, height/2))
        .force("charge", d3.forceManyBody().strength(-100));
    
    function draw(year, indexPol, numRefugees){
        //restart simulation to draw updated data
        d3.selectAll("circle").remove();
        d3.selectAll("line").remove();
        //simulation.stop();
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
        
        //filter connections on year and number of refugees
        var links = data.filter(function(d){return (d.year == year && d.refugee>=numRefugees)});
        
        //modified from https://bl.ocks.org/mbostock/4062045
        var link = svg.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", "grey")
            .attr("stroke-width", function(d){return Math.sqrt(Math.sqrt(d.refugee/1000))});

        link.exit().remove();
        
        var node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d){
                if(d.id == "Afghanistan" || d.id == "Nigeria" || d.id == "Syrian Arab Rep." || d.id == "Somalia" || d.id == "South Sudan")
                    return 7;
                else return 4;
            });

        node.exit().remove();
        
        node.append("title")
            .text(function(d) { return d.id; });
        //end section

        //add nodes
        simulation.nodes(nodes)
            .on("tick", ticked);
        
        //add links with strengths
        var strengthScale = d3.scaleLog().domain(d3.extent(links, function(d){return d.refugee})).range([.5,1]);

        //link strength based on num refugees and political indicators
        //polSource + polSink, prob needs array index oob throw
        simulation.force("link").links(links).strength(function(d, i){
            //var sourceIndex = searchData(d.source.id, stable);
            //var targetIndex = searchData(d.target.id, stable);
            
            var sourceVal = 0;
            var targetVal = 0;
            var i = 0;
            var foundS = false;
            var foundT = false
            while(i<stable.length && !(foundS && foundT)){
                if(stable[i].id == d.source.id){
                    sourceVal = d.source.val;
                    foundS = true;
                }
                if(stable[i].id == d.target.id){
                    targetVal = d.target.val;
                    foundT = true;
                }
                i++;
            }
            console.log("index: "+i+" vals: "+targetVal+" "+sourceVal);
            
            return strengthScale(d.refugee)
        });

        //modified from https://bl.ocks.org/mbostock/4062045
        function ticked(){
        link
            .attr("x1", function(d) {return d.source.x})
            .attr("y1", function(d) {return d.source.y})
            .attr("x2", function(d) {return d.target.x})
            .attr("y2", function(d) {return d.target.y});

        nodes[0].x = width/2;
        nodes[0].y = height/2;
        
        node
            .attr("cx", function(d) {return d.x})
            .attr("cy", function(d) {return d.y});
        }
        //end section
    }
    
}

//returns the index of a key in dict matching country
/*function searchData(country, dict){
    var i = 0;
    var found = false;
    while(i<dict.length || !found){
        if(dict[i].id == country)
            found = true;
        else i++;
    }
    if(found) return i;
    else return -1;
}*/

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
