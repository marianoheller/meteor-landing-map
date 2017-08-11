

const width = 1000;
const height = 600;


(function() {
	const svg = d3.select("#svg")
		.attr("width", width ) 
		.attr("height", height);

    // resize the svg to fill browser window dynamically
    window.addEventListener('resize', resizeSVG, false);

    function resizeSVG() {
			svg.attr("width", window.innerWidth ) 
				.attr("height", window.innerHeight)

            /**
             * Your drawings need to be inside this function otherwise they will be reset when 
             * you resize the browser window and the svg goes will be cleared.
             */
            drawStuff(); 
    }
    resizeSVG();

    function drawStuff() {
            // do your drawing stuff here
    }
})();

var zoom = d3.zoom()
    .scaleExtent([1, 10])
	.on("zoom", zoomed);
	
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
  })


const svg = d3.select("#svg")
.call( d3.zoom().on("zoom", function() {
		svg.attr("transform", d3.event.transform);
	})
)
.append("g");

svg.call(tip);


var mapLayer = svg.append('g')
  	.classed('map-layer', true)
  	.call(zoom);;

var projection = d3.geoMercator();
var path = d3.geoPath(projection);

d3.json('./countries.json', function(error, mapData) {
	var features = mapData.features;


  	mapLayer.selectAll('path')
			.data(features)
			.enter().append('path')
			.attr('d', path)
			.style('fill', "#CCC")
			.style('stroke', "#FFF")
			.attr('vector-effect', 'non-scaling-stroke')
});

d3.json('./meteor-strike-data.json', function(error, mapData) {
	var features = mapData.features;

	const radiusScale = d3.scalePow()
					.domain([ 
						d3.min( features, function(f) { return parseInt(f.properties.mass) }) + 1,
						d3.max( features, function(f) { return parseInt(f.properties.mass) })
					])
					.exponent(2)
					.range([2,20]);

	var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

	console.log( radiusScale(230000) );

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
			.style("opacity", 0.8)
			.on('mouseover', tip.show)
      		.on('mouseout', tip.hide);
});


function zoomed() {
	svg.attr("transform", d3.event.transform)
}
