chartme.donut = function() {

	var
			width  = 300
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, radius
		, donutRate = 0.6
		, valueProperty = "value"
		, labelProperty = "label"
		, svg
		, arc
		, colorScale
		, pieLayout
		;

	function init() {
		colorScale = d3.scale.linear()
			.range(colors);

		radius = Math.min(width, height) * 0.5;

		// Generate arc data used by <path> elements.
		arc = d3.svg.arc()
			.outerRadius(radius * 0.98)
			.innerRadius(radius * donutRate);

		pieLayout = d3.layout.pie()
			.sort(null)
			.value(function (d) { return d[valueProperty]; });
	}

	function chart() {
		init();

		svg = this.append("svg")
				.attr("width", width)
				.attr("height", height)
			.append("g")
				// Move the center of the chart from 0, 0 to radius, radius
				.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");


			// Slice label.
/*

			slices.append("text")
				// Position the label origin to the slice's center.
				.attr("transform", function (d) {
					return "translate(" + arc.centroid(d) + ")";
				})
				// Center the text on its origin.
				.attr("text-anchor", "middle")
				.text(function(d, i) {
					return d.data[labelProperty];
				});
*/

			// var arcHover = d3.svg.arc()
			// 	.innerRadius(radius * 0.21)
			// 	.outerRadius(radius * donutRate * 0.99);

			// var pathHover, circleHover, labelHover;

			// slices.on('mouseover', function (d, i) {

			// 	pathHover = svg.insert("path")
			// 		.attr("fill", colorScale(d.data[valueProperty]))
			// 		.attr("d", arcHover(d))
			// 		;

			// 	circleHover = svg.append("circle")
			// 		.attr("r", radius * 0.2)
			// 		.style("fill", "#eee")
			// 		;

			// 	labelHover = svg.append('text')
			// 		.attr("dy", ".35em")
			// 		.attr("text-anchor", "middle")
			// 		.text(d.data[valueProperty]);
			// });

			// slices.on('mouseout', function (d, i) {
			// 	labelHover.remove();
			// 	circleHover.remove();
			// 	pathHover.remove();
			// });



	}


	// Store the currently-displayed angles in this._current.
	// Then, interpolate from this._current to the new angles.
	// See http://bl.ocks.org/1346410
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function (t) {
			return arc(i(t));
		};
	}

	function renderChart(data) {
		var slices = svg.selectAll("g.slice")
					.data(data);

				// Create.
				slices.enter().append("g")
					.attr("class", "slice")
					// Slice path.
					.append("path")
						.attr("stroke", "#fff")
						.attr("fill", function (d, i) { return colorScale(d.data[valueProperty]); })
						// .attr("d", arc)
					.transition()
						.duration(300)
						// .attrTween("d", arcTween)
						.each(function (d) { this._current = d; })
						;

				// Update.
				slices.select("path").transition()
					.duration(300)
					.attr("fill", function (d, i) { return colorScale(d.data[valueProperty]); })
					.attrTween("d", arcTween)
						// .attr("d", arc)
						;

				// Remove.
				slices.exit().transition()
					.duration(300)
					.select("path")
					.attr("fill", function (d, i) { return colorScale(d.data[valueProperty]); })
					.attrTween("d", arcTween)
					// .attr("fill", "red")
					.remove()
					;
	}

	chart.data = function (data) {
		if (!data) {
			return;
		}

		data.forEach(function (d) {
			d[valueProperty] = +d[valueProperty];
		});

		var max = d3.max(data.map(function (d) { return d[valueProperty]; }));

		colorScale.domain([0, max]);

		data = pieLayout(data);

		renderChart(data);
	};


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
		if (!arguments.length) return colorScale.range();
		colorScale.range(value);
		return chart;
	};

	chart.value = function (value) {
		if (!arguments.length) return valueProperty;
		valueProperty = value;
		return chart;
	};

	chart.label = function (value) {
		if (!arguments.length) return labelProperty;
		labelProperty = value;
		return chart;
	};

	return chart;
};
