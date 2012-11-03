/*global chartme:true, d3:true*/
chartme.bar = function() {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, visWidth
		, visHeight
		, colors = [["#ecf0d1", "#afc331"], ["#e6cfec", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		// , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		, xInputFormat = d3.time.format("%Y%m%d")
		, xOutputFormat = d3.time.format("%d-%m-%Y")
		, xProperty = 'x'
		, yProperty = 'y'
		, yMax
		, svg
		, vis
		, xAxis
		, yAxis
		, xScale
		, yScale
		, colorScale = d3.scale.linear()
		, stackLayout
		, y0 = function (d) { return yScale(d.y0) ; }
		, y1 = function (d) { return yScale(d.y + d.y0) ; }
		;


	function init() {
		// Init metrics.
		visWidth  = width - margin.left - margin.right;
		visHeight = height - margin.top - margin.bottom;

		// Init scales.
		xScale = d3.scale.ordinal()
			.rangeBands([0, visWidth], 0.15);

		yScale = d3.scale.linear()
			.range([visHeight, 0])
			;

		// var xAxisScale = d3.time.scale()
		// 	.range([0, visWidth])
		// 	;

		// Init layout.
		stackLayout = d3.layout.stack()
			.x(function (d) { return d[xProperty]; })
			.y(function (d) { return d[yProperty]; })
			;

		// Init axis.
		// xAxis = d3.svg.axis()
		// 	.scale(xAxisScale)
		// 	.orient("bottom")
		// 	// .ticks(6)
		// 	// .ticks(xAxisScale.ticks(d3.time.days, 1))
		// 	.tickSize(20)
		// 	.tickFormat(function (d) { return xOutputFormat(d); })
		// 	;

		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("right")
			.ticks(4)
			.tickSize(width)
			.tickSubdivide(true)
			;
	}

	function chart() {
		init();

		svg = this.append("svg")
			// .datum(data)
				.attr("width", width)
				.attr("height", height)
				;

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			;

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + 0 + "," + margin.top + ")")
			;

		vis = svg.append("g")
			.attr("class", "vis")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("width", visWidth)
			.attr("height", visHeight)
			;
	}


	function renderChart(data) {

		var layers = vis.selectAll("g.layer")
			.data(data)
			;

		layers.enter().append("g")
			.attr("class", "layer")
			.style("fill", function (d, i) {
				return colorScale.range(colors[i])(yMax * 0.75);
				// return colors[i+1];
			})
			;

		layers.exit().remove();

		var bars = layers.selectAll(".bar")
			.data(function (d) { return d; });

		bars.enter().append("rect")
			.attr("class", "bar")
			// .attr("fill", function (d, i) {
			// 	return this.parentNode.__data__.colorScale(0);
			// })
			.attr("width", xScale.rangeBand())
			.attr("y", yScale(0))
			.attr("height", 0)
			.attr("x", function (d, i) { return xScale(i); })
			// .each(function () { this.__data__.chart = chart; })
			;

		bars.transition()
			.duration(function (d, i) { return (i+1) * 100; })
			.attr("y", y1)
			.attr("height", function (d) { return y0(d) - y1(d); })
			// .attr('fill', function (d, i) {
			// 	return this.parentNode.__data__.colorScale(yMax*0.75);
			// })
			;

		bars.exit().remove();
	}

	function renderAxis(data) {
		// Add x axis.
		// svg.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
		// 	.call(xAxis)
		// 	;

		// svg.selectAll(".x.axis text")
		// 	.attr("y", 10)
		// 	.attr("text-anchor", "start")
		// 	.attr("dx", 4)
		// 	;
		var xAxis
			, x
			, xTick
			;

		// Add x axis.
		xAxis = svg.select(".x.axis")
			.selectAll("g")
			.data(data[0])
			;

		x = function (d, i) { return xScale(i) + xScale.rangeBand() * 0.5; };

		xTick = xAxis.enter().append("g")
			;

		xTick.append("line")
			.attr("class", "tick")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", -10)
			.attr("y2", 10)
			;

		xTick.append("text")
			.attr("x", x)
			.attr("dy", 16)
			.attr("text-anchor", "middle")
			.text(function (d) { return d[xProperty]; })
			;

		// Add y axis.
		svg.select(".y.axis")
			// .transition()
				// .delay(1000)
				// .duration(300)
				.call(yAxis)
				;

		// Position y axis labels.
		svg.selectAll(".y.axis text")
			.attr("x", 0)
			.attr("dy", -2)
			;

		// var transition = svg.transition().duration(750),
		// 		delay = function(d, i) { return i * 50; };

		// transition.selectAll(".bar")
		// 		.delay(delay)
		// 		.attr("x", function (d) { return x0(d.letter); });

		// transition.select(".x.axis")
		// 		.call(xAxis)
		// 	.selectAll("g")
		// 		.delay(delay);
	}


	chart.update = function (data) {
		if (!data) {
			return;
		}

		// data.forEach(function (d) {
		// 	d[xProperty] = xInputFormat.parse(d[xProperty]);
		// 	d[yProperty] = +d[yProperty];
		// });

		data = stackLayout(data);

		yMax = d3.max(data, function (d) {
			return d3.max(d, function (d) {
				return d.y + d.y0;
			});
		});

		// Update domain scales with the new data.
		xScale.domain(d3.range(0, data[0].length));
		yScale.domain([0, yMax]);
		colorScale.domain([0, yMax]);

		// Render chart and axis.
		renderChart(data);
		renderAxis(data);
	};


	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		return chart;
	};

	chart.height = function (value) {
		if (!arguments.length) return height;
		height = value ? value : height;
		return chart;
	};

	chart.colors = function (value) {
		if (!arguments.length) return colors;
		colors = value;
		return chart;
	};

	chart.x = function (value) {
		if (!arguments.length) return xProperty;
		xProperty = value;
		return chart;
	};

	chart.y = function (value) {
		if (!arguments.length) return yProperty;
		yProperty = value;
		return chart;
	};

	chart.xInputFormat = function (value) {
		if (!arguments.length) return xInputFormat;
		xInputFormat = value;
		return chart;
	};

	chart.xOutputFormat = function (value) {
		if (!arguments.length) return xOutputFormat;
		xOutputFormat = value;
		return chart;
	};

	return chart;
};