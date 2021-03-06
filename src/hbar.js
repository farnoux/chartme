/*global chartme:true, d3:true*/
chartme.hbar = function () {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, visWidth
		, visHeight
		, colors = [["#e6f6ff", "#98d8fd"], ["#e6cfec", "#9632b1"], ["#ecf0d1", "#afc331"]]
		// , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		, xProperty = 'x'
		, yProperty = 'y'
		, minRangeBand = 50
		, yMax
		, svg
		, vis
		, xAxis
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
		visHeight = height - margin.top - margin.bottom;

		// Init layout.
		stackLayout = d3.layout.stack()
			.x(function (d) { return d[xProperty]; })
			.y(function (d) { return d[yProperty]; })
			;

		// Init axis.
		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("bottom")
			.ticks(2)
			.tickSize(visHeight)
			.tickSubdivide(true)
			;
	}

	function widthChange() {
		visWidth  = width - margin.left - margin.right;

		svg.attr("width", width);
		vis.attr("width", visWidth);

		yScale.range([visWidth, 0]);

		// xScale.rangeBands([0, visWidth], 0.15);
		// yAxis.tickSize(width);
	}

	function chart() {
		init();

		svg = this.append("svg")
				.attr("height", height)
				;

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			;

		vis = svg.append("g")
			.attr("class", "vis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			.attr("height", visHeight)
			;

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			;

		widthChange();
	}

	function dataKey (d) {
		return d[xProperty];
	}

	function barY (d, i) {
		return xScale(i);
	}


	function renderChart(data) {

		var layers = vis.selectAll("g.layer")
			.data(data)
			;

		layers.enter().append("g")
			.attr("class", "layer")
			.style("fill", function (d, i) { return colors[i][1]; })
				// return colorScale.range(colors[i])(yMax * 0.75);
				// return colors[i+1];
			// })
			;

		layers.exit().remove();

		var bars = layers.selectAll(".bar")
			.data(function (d) { return d; }, dataKey);

		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", 0)
			.attr("width", 0)
			.attr("height", xScale.rangeBand())
			.attr("y", barY)
			;

		bars.transition()
			.duration(200)
			.attr("x", y0)
			.attr("width", function (d) { return y1(d) - y0(d); })
			.attr("height", xScale.rangeBand())
			.attr("y", barY)
			;

		bars.exit().remove();
	}

	function renderAxis(data) {
		// Add x axis.
		var xAxis
			, x
			, xTick
			;

		// Add x axis.
		xAxis = svg.select(".x.axis")
			.selectAll("g")
			.data(data[0], dataKey)
			;

		x = function (d, i) { return xScale(i) + xScale.rangeBand() * 0.5; };

		xTick = xAxis.enter()
			.append("g");

		xTick.append("text")
			.attr("y", x)
			.attr("dx", 4)
			.attr("dy", 4)
			.attr("text-anchor", "left")
			.text(function (d) { return d[xProperty]; })
			;

		xAxis.select("text").transition()
			.duration(200)
			.attr("y", x);

		xAxis.exit().remove();

		// Add y axis.
		svg.select(".y.axis")
			.call(yAxis)
			;

		// Position y axis labels.
		svg.selectAll(".y.axis text")
			.attr("y", height - margin.bottom)
			.attr("dy", -5)
			;
	}

	function yMaxChange(max) {
		yScale.domain([max, 0]);
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

		xScale.rangeBands([-visHeight, 0], 0.15);

		if (xScale.rangeBand() > minRangeBand) {
			xScale.rangeBands([-minRangeBand * 1.15 * data[0].length, 0], 0.15);
		}

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

	chart.minRangeBand = function (value) {
		if (!arguments.length) return minRangeBand;
		minRangeBand = value;
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
//@ sourceURL=hbar.js
