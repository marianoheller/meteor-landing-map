

const width = 1000;
const height = 600;
let active = d3.select(null);


const zoom = d3.zoom().on("zoom", zoomed)
				//.scaleExtent([1,8]);
				//.translateExtent([ 0, 0], [window.innerWidth/2, window.innerHeight/2])


	
var tip = d3.tip()
  .attr('class', 'd3-tip')
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
			.attr("height", "100%")
			.attr("viewBox", `0 0 961 922`)
			//.attr("viewBox", `0 0 ${window.innerWidth/2} ${window.innerHeight/2}`)
			.call( zoom );

svg.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%")
    .on("click", reset);

const mapLayer = svg.append("g")
				.classed('map-layer', true);



svg.call(tip);



var projection = d3.geoMercator();
var path = d3.geoPath(projection);


function drawStuff() {
	d3.json('./countries.json', function(error, mapData) {
		var features = mapData.features;


	  	mapLayer.selectAll('path')
				.data(features)
				.enter().append('path')
				.attr('d', path)
				.style('fill', "#CCC")
				.style('stroke', "#FFF")
				.attr('vector-effect', 'non-scaling-stroke');

	});

	d3.json('./meteor-strike-data.json', function(error, mapData) {
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



window.addEventListener('resize', resizeSVG, false);



function resizeSVG() {
		console.log("resized");
		/*
		svg.attr("width", "100%" ) 
			.attr("height", "100%")
			//.attr("viewBox", "0 0 1000 600")
			.attr("viewBox", `0 0 ${window.innerWidth/2} ${window.innerHeight/2}`);
*/
/*
	  	mapLayer.attr("x", 0)
	  	.attr("width", window.innerWidth ) 
		.attr("height", window.innerHeight );
*/

        drawStuff(); 
}

function zoomed() {
	svg.attr("transform", d3.event.transform);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

resizeSVG();