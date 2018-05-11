var margin={t: 40, r: 5, b: 40, l: 5};
var width = d3.select('#plot3').node().clientWidth - margin.r - margin.l,
    height = d3.select('#plot3').node().clientHeight - margin.t - margin.b;

var plot3=d3.select('#plot3').append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height+margin.t+margin.b)
    .append("g")
    .attr("transform","translate("+margin.l+","+margin.t+")");

var x = d3.scaleBand().range([0,width]);
var y = d3.scaleLinear().range([height,0]);

var xAxis = d3.axisBottom();
var yAxis = d3.axisLeft.ticks(10);

var queue=d3.queue().defer(d3.csv,"data/political_stability.csv",parseData)
    .await(dataloaded);

function dataloaded(error,data){
    d3.selectAll(".btnBarChart").on("click",function(){
        var thisYear=this.getAttribute("id");
        draw(thisYear)
    })
    
function draw(year){
    console.log(year)

    x.domain(data.map(function(d){return d.Country;}));
    y.domain(d3.extent(data, function(d){return +d.year}));//d3.min(data,function(d){return +d.year;}),d3.max(data,function(d){return +d.year;}));

    var barWidth=width/data.length;
    var bars=plot3.selectAll(".bar").remove().exit().data(data);

    bars.enter().append("rect").attr("class","bar")
        .attr("x",function(d,i){ return i*barWidth+1;})
        .attr("y",function(d){ return y(d.year);})
        .attr("height",function(d){ return height-y(d.year);})
        .attr("width",barWidth-1)
        .attr("fill","#99bbff");
}

plot3.append("g")
    .attr("class", ".y")
    .call(yAxis);
    
plot3.append("g")
    .attr("class",".xAxis")
    .attr("transform","translate(0,"+height+")")
    .call(xAxis).selectAll("text")
    .style("text-anchor","end")
    .attr("transform",function(d){return "rotate(-65)";});
    //^this might throw an error

plot3.append("text")
    .attr("transform","translate(-35,"+(height+margin.b)/2+") rotate(-90)")
    .attr("x", 0)
    .attr("y", 0)
    .text("Political Stability Index");

plot3.append("text")
    .attr("transform","translate("+width/2+","+height+margin.b-5+")")
    .attr("x", 0)
    .attr("y", 0)
    .text("Country");

function parseData(d){
    return{
        Country: d.Country
    }
}