chartme.bar = function(data) {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, xInputFormat = d3.time.format("%Y%m%d")
		, xOutputFormat = d3.time.format("%d-%m-%Y")
		, xProperty = 'x'
		, yProperty = 'y'
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, yMax
		, svg
		, guideline
		, xScale
		, yScale
		, bar
		;


	function chart(selection) {
		width = width - margin.left - margin.right;
		height = height - margin.top - margin.bottom;

		selection.each(function (d, i) {

			xScale = d3.scale.ordinal()
				.rangeRoundBands([0, width], 0.15);

			yScale = d3.scale.linear()
				.range([height, 0])
				.nice()
				;


			// var xTimeScale = d3.time.scale()
			// 	.domain(d3.extent(data, function (d) { return d[xProperty]; }))
			// 	.range([0, width]);

			var colorScale = d3.scale.linear()
				.range(colors);


			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				// .ticks(0)
				.tickSize(10)
				.tickFormat(function (d) { return xOutputFormat(d); })
				;

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("right")
				.ticks(4)
				.tickSize(width + margin.left + margin.right)
				.tickSubdivide(true)
				;

			svg = d3.select(this).append("svg")
				.datum(data)
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin. bottom)
					;

			svg = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			function updateAxis() {
				// Add x axis.
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(" + '0' + "," + height + ")")
					.call(xAxis)
					;

				// Add y axis.
				svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + '0' + "," + margin.top + ")")
					.call(yAxis);

				// Position y axis labels.
				svg.selectAll(".y.axis text")
					.attr("x", 0)
					.attr("dy", -2);
			}

			chart.update = function update (data) {
				if (!data) {
					return;
				}

				data.forEach(function (d) {
					d[xProperty] = xInputFormat.parse(d[xProperty]);
					d[yProperty] = +d[yProperty];
				});

				yMax = d3.max(data.map(function (d) { return d[yProperty]; }));


				// xScale.domain(d3.range(0, data.length));
				// console.log(data.map(function (d) { return d[xProperty]; }));
				xScale.domain(data.map(function (d) { return d[xProperty]; }));
				yScale.domain([0, yMax]);
				colorScale.domain([min, yMax]);
				// xTimeScale.domain(d3.extent(data, function (d) { return d[xProperty]; }));

				updateAxis();

				var bars = svg.selectAll(".bar")
					.data(data);

				bars.enter().append("rect")
					.attr("class", "bar")
					.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
					.attr("width", xScale.rangeBand())
					.attr("y", function (d, i) { return yScale(d[yProperty]); })
					.attr("height", function (d) { return height - yScale(d[yProperty]) + 4; })
					.attr("x", function (d, i) { return xScale(i); })
					.each(function (d) { this.__data__.chart = chart; })
					;

				bars.transition()
					.duration(300)
					.attr("y", function (d, i) { return yScale(d[yProperty]); })
					.attr("height", function (d) { return height - yScale(d[yProperty]) + 4; })
					.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
					;

				bars.exit().remove();


						// var transition = svg.transition().duration(750),
		// 		delay = function(d, i) { return i * 50; };

		// transition.selectAll(".bar")
		// 		.delay(delay)
		// 		.attr("x", function(d) { return x0(d.letter); });

		// transition.select(".x.axis")
		// 		.call(xAxis)
		// 	.selectAll("g")
		// 		.delay(delay);
			};

			chart.update(data);

		});
	}

	chart.width = function(value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		return chart;
	};

	chart.height = function(value) {
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