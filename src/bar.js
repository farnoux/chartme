/*global chartme:true, d3:true*/
chartme.bar = function () {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 50 }
		, width  = 600
		, height = 300
		, visWidth
		, visHeight
		, colors = [["#ecf0d1", "#d8e0a0", "#afc331"], ["#e6cfec", "#cd9dd8", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		// , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		, xProperty = 'x'
		, yProperty = 'y'
		, yMax
		, svg
		, vis
		, yAxis
		, xScale = d3.scale.ordinal()
		, yScale = d3.scale.linear()
		, colorScale = d3.scale.linear()
		, stackLayout
		, y0 = function (d) { return yScale(d.y0) ; }
		, y1 = function (d) { return yScale(d.y + d.y0) ; }
		, currentData
		;


	function init() {
		// Init metrics.
		// visWidth  = width - margin.left - margin.right;
		visHeight = height - margin.top - margin.bottom;

		// Init scales.
		yScale.range([visHeight, 0]);

		// Init layout.
		stackLayout = d3.layout.stack()
			.x(function (d) { return d[xProperty]; })
			.y(function (d) { return d[yProperty]; })
			;

		// Init axis.
		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("right")
			.ticks(2)
			.tickSubdivide(true)
			;
	}

	function widthChange() {
		visWidth  = width - margin.left - margin.right;

		svg.attr("width", width);
		vis.attr("width", visWidth);

		xScale.rangeBands([0, visWidth], 0.15);
		yAxis.tickSize(width);
	}

	function chart() {
		init();

		svg = this.append("svg")
				// .attr("width", width)
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
			// .attr("width", visWidth)
			.attr("height", visHeight)
			;

		widthChange(width);
	}


	function renderChart(data) {
		var layers = vis.selectAll("g.layer")
			.data(data)
			;

		layers.enter().append("g")
			.attr("class", "layer")
			.style("fill", function (d, i) { return colors[i][1]; })
			;

		layers.exit().remove();

		var bars = layers.selectAll(".bar")
			.data(function (d) { return d; });

		bars.enter().append("rect")
			.attr("class", "bar")
			// .attr("fill", function (d, i) {
			// 	return this.parentNode.__data__.colorScale(0);
			// })
			.attr("x", function (d, i) { return xScale(i); })
			.attr("width", xScale.rangeBand())
			.attr("y", yScale(0))
			.attr("height", 0)
			;

		bars.transition()
			.duration(300)
			.attr("x", function (d, i) { return xScale(i); })
			.attr("width", xScale.rangeBand())
			.attr("y", y1)
			.attr("height", function (d) { return y0(d) - y1(d); })
			;

		bars.exit().remove();
	}

	function renderAxis(data) {
		var xAxis
			, x
			, xTick
			, maxTick = 8
			, axisData = data[0]
			, tickEachIndex = 1
			;

		if (axisData.length > maxTick) {
			tickEachIndex = Math.ceil(axisData.length / maxTick);
			axisData = axisData.filter(function (d, i) { return !(i % tickEachIndex); });
		}

		// Add x axis.
		xAxis = svg.select(".x.axis")
			.selectAll("g")
			.data(axisData)
			;

		x = function (d, i) { return xScale(i * tickEachIndex) + xScale.rangeBand() * 0.5; };

		xTick = xAxis.enter().append("g")
			;

		xTick.append("line")
			.attr("class", "tick")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", 0)
			.attr("y2", 5)
			;

		xTick.append("text")
			.attr("x", x)
			.attr("dy", 16)
			.attr("text-anchor", "middle")
			.text(function (d) { return d[xProperty]; })
			;

		xAxis.select("line").transition()
			.duration(300)
			.attr("x1", x)
			.attr("x2", x)
			;

		xAxis.select("text").transition()
			.duration(300)
			.attr("x", x)
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

	function yMaxChange(max) {
		yScale.domain([0, max]);
		colorScale.domain([0, max]);
	}


	chart.data = function (data) {
		if (!data) {
			return chart;
		}

		var max;

		// Force values to be integer.
		data.forEach(function (d) {
			d.forEach(function (d) {
				d[yProperty] = +d[yProperty];
			});
		});

		// Apply the stack layout function on the data.
		data = stackLayout(data);

		// If yMax has been set manually use it, otherwise calculate it from the data.
		if (yMax) {
			max = yMax;
		}
		else {
			max = d3.max(data, function (d) {
				return d3.max(d, function (d) {
					return d.y + d.y0;
				});
			});
		}

		yMaxChange(max);

		// Update domain scales with the new data.
		xScale.domain(d3.range(0, data[0].length));

		currentData = data;

		// Render chart and axis.
		renderChart(data);
		renderAxis(data);

		return chart;
	};


	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		if (currentData) {
			widthChange();
		}
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

	chart.yMax = function (value) {
		if (!arguments.length) return yMax;
		yMax = value;
		return chart;
	};

	chart.yAxis = function () {
		return yAxis;
	};

	chart.refresh = function () {
		renderChart(currentData);
		renderAxis(currentData);
		return chart;
	};

	return chart;
};