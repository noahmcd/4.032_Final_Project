var queue = d3.queue()
    .defer(d3.csv, "map data/2015 refugees.csv", parseRefugeeData)
    .defer(d3.csv, "map data/2016 refugees.csv", parseRefugeeData)
    .await(dateLoaded);

var margin = {t: 40, r: 5, b: 40, l: 5};

var width  = d3.select('#map-viz').node().clientWidth  - margin.r - margin.l;
var height = d3.select('#map-viz').node().clientHeight - margin.t - margin.b;

var plot1 = d3.select('#map-viz') 
            .append('svg')
            .attr('width',  width  + margin.r + margin.l)
            .attr('height', height + margin.t + margin.b);

var plotPulses = plot1.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')').attr('class', 'pulses');

var blue   = "#66b2c5";
var yellow = "#ffb400";
var red    = "#c63232";
var green  = "#72a746";
var maxR   = height;
var minR   = height/10;

var locations = {
    "South Sudan": {
        cx: 0.59,
        cy: 0.75
    },
    "Afghanistan": {
        cx: 0.93,
        cy: 0
    },
    "Nigeria": {
        cx: 0.3,
        cy: 0.82
    },
    "Syrian Arab Rep.": {
        cx: 0.84,
        cy: -0.02
    },
    "Somalia": {
        cx: 0.79,
        cy: 0.9
    }
}


// Array
function dateLoaded(error, refugees2015, refugees2016){

    if(error) throw error;

    var origins2015 = AddOrigins(refugees2015);
    var origins2016 = AddOrigins(refugees2016);

    var delta20152016 = FindDeltas(origins2015, origins2016);

    var sampleCountries = ["South Sudan", "Afghanistan", "Nigeria", "Syrian Arab Rep.", "Somalia"];

    var data = [];

    sampleCountries.forEach(function (sampleCountry) {

        var countryData = {
            name: sampleCountry,
            delta: 1/Math.abs(delta20152016[sampleCountry]),
            value: origins2016[sampleCountry],
            cx: locations[sampleCountry].cx,
            cy: locations[sampleCountry].cy
        }

        data.push(countryData);
    });

    Pulses(data);
}

function parseRefugeeData(d){

    return {
        origin: d.Origin,
        country: d.Country,
        month: d.Month,
        value: d.Value
    }
}


function AddOrigins(refugees) {

    var addedRefugees = {};

    refugees.forEach(function (refugee) {

        var origin = refugee.origin;
        var value  = parseInt(refugee.value);

        value = value ? value : 0;

        addedRefugees[origin] = (addedRefugees[origin] || 0) + value;

    });

    return addedRefugees;
}

// Dataset A - Database B
function FindDeltas(refugees2015, refugees2016) {

    var deltaRefugees = {};

    _.forEach(refugees2015, function(value, origin) {
        if (refugees2016[origin]) {
            deltaRefugees[origin] = (refugees2016[origin] - value)/value;
        }
    });

    return deltaRefugees;
}

function Pulses(data) {

    var scaleR = d3.scaleSqrt().range([minR,maxR]);

    var scaleT = d3.scaleSqrt().range([0.75,3.5]);

    var extentMedals = d3.extent(data,function(d){return d.value});
    scaleR.domain(extentMedals);

    var extentTime = d3.extent(data,function(d){return d.delta});
    scaleT.domain(extentTime);

    // Update Legend
    var percent = Math.round(1/scaleT.invert(1)*100);
    var people  = Math.round(scaleR.invert(100));

    d3.selectAll("#percent-change-threshold").text(percent);
    d3.selectAll("#people-threshold").text(people);

    var circles = plotPulses.selectAll(".pulses")
            .data([1,2,3,4,5],function(d) { return d});

    function draw (rate, code, color, cx, cy, r, name) { 

        var className = "pulses-" + code;

        var spots = plotPulses
            .selectAll("." + className)
            .data([{cx: cx, cy: cy, r:r, name: name}])
            
        spots
            .enter()
            .append("circle")
            .attr("class",className + " pulses")
            .attr("cx", function(d){
                return width * d.cx
            });

        spots
            .enter()
            .append("text")
            .attr("x", function(d) { return width * d.cx })
            .attr("y", function(d) { return height * d.cy })
            .text(function(d) { return d.name });

        repeat();

        function repeat () {
        
            //console.log("drawingggg", className)

            plotPulses
                .selectAll("." + className)
                .attr("r",0)
                .style("fill", color)
                .style("opacity",1)
                .attr("cy",  function(d){
                    return height * d.cy
                })
                .transition()
                .duration(rate * 1000)
                .attr("r",function(d){
                    return d.r
                })
                .style("opacity",0)
                .on("end", repeat);
        }
    }

    data.forEach(function (countryData, i) {
        draw(scaleT(countryData.delta), i, red, countryData.cx, countryData.cy, scaleR(countryData.value), countryData.name);
    });
}

window.addEventListener('resize', function(){
    console.log("OH NO: TODO");
}); 



function weightedRandom(target, variance) {
    variance = Math.random() > 0.5 ? variance : 0 - variance;
    return target + Math.random()*variance
}
