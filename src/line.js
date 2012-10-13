chartme.line = function(data) {

	var
		  margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600 - margin.left - margin.right
		, height = 300 - margin.top - margin.bottom
		, colors = ["#ecf0d1", "#afc331"]
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, max = d3.max(data.map(function (d) { return d.value; }))
		, svg
		;

		// see http://bl.ocks.org/3310233

	function chart(selection) {
		selection.each(function (d, i) {

			var x = d3.scale.linear()
				.domain([0, data.length - 1])
				.range([0, width]);

			var y = d3.scale.linear()
				.domain([0, max])
				.range([height, 0])
				.nice()
				;

			var yAxis = d3.svg.axis()
				.scale(y)
				.ticks(4)
				.tickSize(width)
				.tickSubdivide(true)
				.orient("left")
				;

			svg = d3.select(this).append("svg")
				.datum(data)
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin. bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var line = d3.svg.line()
				.x(function (d, i) { return x(i); })
				.y(function (d) { return y(d.value); })
				.interpolate('cardinal');

			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + width + ",0)")
				.call(yAxis);

			svg.append("path")
				.attr("class", "line")
				.attr("d", line);

			svg.selectAll(".dot")
					.data(data)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("cx", line.x())
					.attr("cy", line.y())
					.attr("r", 3.5);
		});
	}

	chart.width = function(value) {
		if (!arguments.length) return width;
		width = value;
		return chart;
	};

	chart.height = function(value) {
		if (!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.colors = function (value) {
		if (!arguments.length) return colors;
		colors = value;
		return chart;
	};


	return chart;
};
