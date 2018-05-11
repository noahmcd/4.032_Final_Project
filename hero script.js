function populate(x, y, vx, vy, time, pop) {
	for(var i = 0; i < pop ; i++) {
		offset(i, time, x, y, vx, vy);
	}
}

function offset(i, scale, x, y, vx, vy) {
	setTimeout(function() {
		addRefugee(weightedRandom(x,vx), weightedRandom(y,vy));
	}, i*scale*Math.random());
}

function addRefugee(x, y) {
	var refugee = d3.selectAll("#hero")
	.append("p")
	.text("REFUGEE")
	.style("top",y + "vh")
	.attr("class", "hero-refugee")
	.style("left",x + "vw")
	;

	repeat();

        function repeat () {
        
            //console.log("drawingggg", className)
            refugee
                .style("opacity",.7)
                .transition()
                .duration(1000*Math.random() + 1000)
                .style("opacity",0)
                .transition()
                .duration(1000*Math.random() + 1000)
                .style("opacity",.7)
                .on("end", repeat);
        }
}

// Random noise
populate(50, 50, 50, 50, 100, 500);
populate(25, 25, 40, 40, 100, 25);
