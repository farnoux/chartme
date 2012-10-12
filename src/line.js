chartme.line = function(data) {

	var
		  width  = 300
		, height = 300
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
				.domain([0, max])
				.range([0, w - 10]);

			var y = d3.scale.ordinal()
				.domain(d3.range(0, data.length))
				.rangeBands([0, height - 10], 0.15);

			svg = d3.select(this).append("svg")
				.data([data])
					.attr("width", width)
					.attr("height", height)
				.append("g");


			var label = svg.append('text')
				.attr("text-anchor", "middle")
				;

			var color = d3.scale.linear()
				.domain([min, max])
				.range(colors);

			svg.selectAll('');
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
