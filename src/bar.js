chartme.bar = function(data) {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, dateFormat = '%Y%m%d'
		, xProperty = 'x'
		, yProperty = 'y'
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, max
		, svg
		, guideline
		, xScale
		, yScale
		, bar
		;


	function chart(selection) {
		width = width - margin.left - margin.right;
		height = height - margin.top - margin.bottom;

		var inputDateFormat = d3.time.format(dateFormat);
		var outputDateFormat = d3.time.format('%d-%m-%Y');

		data.forEach(function (d) {
			d[xProperty] = inputDateFormat.parse(d[xProperty]);
			d[yProperty] = +d[yProperty];
		});

		max = d3.max(data.map(function (d) { return d[yProperty]; }));

		selection.each(function (d, i) {

			xScale = d3.scale.ordinal()
				.domain(d3.range(0, data.length))
				.rangeRoundBands([0, width], 0.15);



			var xTimeScale = d3.time.scale()
				.domain(d3.extent(data, function (d) { return d[xProperty]; }))
				.range([0, width]);

			yScale = d3.scale.linear()
				.domain([0, max])
				.range([height, 0])
				.nice()
				;

			var colorScale = d3.scale.linear()
				.domain([min, max])
				.range(colors);


			var xAxis = d3.svg.axis()
				.scale(xTimeScale)
				.orient("bottom")
				.ticks(6)
				.tickFormat(outputDateFormat)
				;

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.ticks(4)
				.tickSize(width + margin.left + margin.right)
				.tickSubdivide(true)
				.orient("right")
				;

			svg = d3.select(this).append("svg")
				.datum(data)
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin. bottom)
					;

			// Add x axis.
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(" + '0' + "," + (height + margin.top) + ")")
				.call(xAxis);

			// Add y axis.
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + '0' + "," + margin.top + ")")
				.call(yAxis);

			svg.selectAll(".y.axis text")
				.attr("x", 0)
				.attr("dy", -2);

			svg = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
					.attr("class", "bar")
					.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
					.attr("width", xScale.rangeBand())
					.attr("y", function (d, i) { return yScale(d[yProperty]); })
					.attr("height", function (d) { return height - yScale(d[yProperty]) + 4; })
					.attr("x", function (d, i) { return xScale(i); })
					;

			// see http://stackoverflow.com/questions/10727892/how-to-center-the-bootstrap-tooltip-on-an-svg
			$("svg .bar").tooltip({
				  html: true
				, title: function () {
					var d = this.__data__;
					return '<b>' + d[yProperty] + '</b><br>' + outputDateFormat(d[xProperty]);
				}
			});


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

	chart.dateFormat = function (value) {
		if (!arguments.length) return dateFormat;
		dateFormat = value;
		return chart;
	};

	return chart;
};