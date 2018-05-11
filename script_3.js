var margin={t: 40, r: 5, b: 40, l: 5};
var width = d3.select('#plot3').node().clientWidth - margin.r - margin.l,
    height = d3.select('#plot3').node().clientHeight - margin.t - margin.b;

var plot3=d3.select('#plot3').append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height+margin.t+margin.b)
    .append("g")
    .attr("transform","translate("+(50+margin.l)+","+margin.t+")");

var x = d3.scaleBand().range([0,width]);
var y = d3.scaleLinear().range([height,0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y).ticks(10);

var queue=d3.queue().defer(d3.csv,"data/political_stability.csv",parseData)
    .await(dataloaded);

function dataloaded(error,data){
    d3.selectAll(".btnBarChart").on("click",function(){
        var thisYear=this.getAttribute("id");
        var indices = []
        for(var i=0; i<data.length; i++){
            switch(thisYear){
                case "2012": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].val12
                    });
                    break;
                case "2013": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].val13
                    });
                    break;
                case "2014": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].val14
                    });
                    break;
                case "2015": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].val15
                    });
                    break;
                case "2016": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].val16
                    })
                    break;
                case "Average": 
                    indices.push({
                    Country: data[i].Country,
                    value: data[i].average
                    });
                    break;
            }
        }
        draw(thisYear, indices)
    })

    function draw(year, data){
        d3.selectAll(".bar").remove();
        
        x.domain(data.map(function(d){return d.Country;}));
        y.domain(d3.extent(data, function(d){return +d.value}));//d3.min(data,function(d){return +d.year;}),d3.max(data,function(d){return +d.year;}));

        var barWidth=width/data.length;
        
        var bars = plot3.append("g")
            .selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class","bar")
            .attr("x",function(d,i){ return i*barWidth+1;})
            .attr("y",function(d){ return height - y(d.value);})
            .attr("height",function(d){ return Math.abs(y(d.value));})
            .attr("width",barWidth-1)
            .attr("fill","#99bbff");
        
        bars.exit().remove();
    }

    plot3.append("g")
        .attr("class", "yAxis")
        .call(yAxis);

    /*plot3.append("g")
        .attr("class","xAxis")
        .attr("transform","translate(0,"+height+")")
        .call(xAxis)
        .selectAll("text")
        .data(data)
        .enter()
        .style("text-anchor","end")
        .attr("transform",function(d){return "rotate(-65)";})
        .text(function(d){return d.Country});*/
        //^this might throw an error

    plot3.append("text")
        .attr("transform","translate(-35,"+(height+margin.b)/2+") rotate(-90)")
        .attr("x", 0)
        .attr("y", 0)
        .text("Political Stability Index");

    plot3.append("text")
        .attr("transform","translate("+width/2+","+(height + margin.b - 5)+")")
        .attr("x", 0)
        .attr("y", 0)
        .text("Country");
}
    
function parseData(d){
    return{
        Country: d.Country,
        val12: +d[2012],
        val13: +d[2013],
        val14: +d[2014],
        val15: +d[2015],
        val16: +d[2016],
        average: +d.Average
    }
}
