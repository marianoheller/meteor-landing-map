

const width = 961;
const height = 450;
const marginTip = 150;
let active = d3.select(null);


const zoom = d3.zoom()
			.scaleExtent([1,10])
			.on("zoom", zoomed);
	
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction( 'se' )
  .offset([-10, 0])
  .html(function(d) {
	return `
	<div class="tooltip">
		<strong>Name:</strong> ${d.properties.name}<br>
		<strong>Mass:</strong> ${d.properties.mass}<br>
		<strong>RecClass:</strong> ${d.properties.recclass}<br>
		<strong>RecLat:</strong> ${d.properties.reclat}<br>
		<strong>RecLong:</strong> ${d.properties.reclong}<br>
		<strong>Year:</strong> ${d.properties.year.split("-").shift()}<br>
	</div>
	`;
  });

const svg = d3.select("#svg")
			.attr("width", "100%" )
			.attr("viewBox", `0 0 ${width} ${height}`);
			
const background = 	svg.append("rect")
					.attr("fill", "white")
					.attr("x", "-100")
					.attr("y", "-100")
					.attr("width", width)
					.attr("height", height);

const mapLayer = svg.append("g")
				.classed('map-layer', true);



svg.call(tip);
svg.call( zoom );

svg.on("mousemove", function() {
	var coordinates = d3.mouse(this);
	var x = coordinates[0];
	var y = coordinates[1];
	var xDirection = 'e';
	var yDirection = 's';
	if ( x > width - marginTip ) {
		xDirection = 'w';
	}
	if ( y > height - marginTip ) {
		yDirection = 'n';
	}
	tip.direction( yDirection + xDirection );
});

d3.select("body")
.on("click", function() {
	console.log(d3.mouse(this));
})



var projection = d3.geoMercator();
var path = d3.geoPath(projection);


function drawStuff() {

	const drawMeteors = function drawMeteors() {
		d3.json('./meteor-strike-data.json', function(error, mapData) {
			if (error) throw new Error(error);
			var features = mapData.features;

			const range = 180000;
			const radiusScale = d3.scaleThreshold()
							.domain([ 
								range*2,
								range*3,
								range*20,
								range*100,
							])
							.range([ 2, 3, 9, 21, 40]);

			var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

			mapLayer.selectAll('path')
					.data(features)
					.enter().append('path')
					.attr('d', function(feature) {
						path.pointRadius( radiusScale(feature.properties.mass) );
						return path(feature);
					} )
					.attr('vector-effect', 'non-scaling-stroke')
					.style('fill', function(d) {
						return colorScale(d.properties.name)
					})
					.style("opacity", 0.75)
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide);
		});
	}

	d3.json('./countries.json', function(error, mapData) {
		if (error) throw new Error(error);

		var features = mapData.features;


	  	mapLayer.selectAll('path')
				.data(features)
				.enter().append('path')
				.attr('d', path)
				.style('fill', "#CCC")
				.style('stroke', "#FFF")
				.attr('vector-effect', 'non-scaling-stroke');

		drawMeteors();
	});
}



function zoomed() {
	const transform = d3.event.transform;
	var coordinates = d3.mouse(this);
	var x = coordinates[0];
	var y = coordinates[1];
	console.log(transform);
	svg.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
	//svg.attr("transform", "translate(" + 0 + "," + 0 + ") scale(" + transform.k + ")");
	//svg.attr("transform", transform );
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

drawStuff();