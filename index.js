
const width = 1000;
const height = 600;


var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);


const svg = d3.select("body")
.append("svg")
.attr("width", width ) 
.attr("height", height)
.call( d3.zoom().on("zoom", function() {
		svg.attr("transform", d3.event.transform);
	})
)
.append("g");


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
			.style('fill', "#DDD")
			.attr('vector-effect', 'non-scaling-stroke')
});

d3.json('./meteor-strike-data.json', function(error, mapData) {
	var features = mapData.features;

	const radiusScale = d3.scaleLinear()
					.domain([ 
						d3.min( features, function(f) { return parseInt(f.properties.mass) }),
						d3.max( features, function(f) { return parseInt(f.properties.mass) })
					])
					.range([2,20])
					.clamp(true);

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
			.style("opacity", 0.8);
});


function zoomed() {
	svg.attr("transform", d3.event.transform)
}
