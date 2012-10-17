chartme.donut = function(data) {

	var
			width  = 300
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, radius
		, donutRate = 0.6
		, min = 0
		, max
		, valueProperty = "value"
		, labelProperty = "label"
		, svg
		;

	function chart(selection) {
		data.forEach(function (d) {
			d[valueProperty] = +d[valueProperty];
		});

		radius = Math.min(width, height) * 0.5;
		max = d3.max(data.map(function (d) { return d[valueProperty]; }));

		selection.each(function (d, i) {

			svg = d3.select(this).append("svg")
					.attr("width", width)
					.attr("height", height)
				.append("g")
					// Move the center of the chart from 0, 0 to radius, radius
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


			var colorScale = d3.scale.linear()
				.domain([min, max])
				.range(colors);

			// Generate arc data used by <path> elements.
			var arc = d3.svg.arc()
				.outerRadius(radius * 0.98)
				.innerRadius(radius * donutRate);

			var pie = d3.layout.pie()
				.sort(null)
				.value(function (d) { return d[valueProperty]; });

			var slices = svg.selectAll('g.slice')
				.data(pie(data));

			slices.enter().append('g')
					.attr('class', 'slice');

			// Slice path.
			var arcs = slices.append('path')
				.attr("stroke", "#fff")
				.attr('fill', function (d, i) { return colorScale(d.data[valueProperty]); })
				.attr('d', arc);

			// Slice label.
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

			var arcHover = d3.svg.arc()
				.innerRadius(radius * 0.21)
				.outerRadius(radius * donutRate * 0.99);

			var pathHover, circleHover, labelHover;

			slices.on('mouseover', function (d, i) {

				pathHover = svg.insert("path")
					.attr("fill", colorScale(d.data[valueProperty]))
					.attr("d", arcHover(d))
					;

				circleHover = svg.append("circle")
					.attr("r", radius * 0.2)
					.style("fill", "#eee")
					;

				labelHover = svg.append('text')
					.attr("dy", ".35em")
					.attr("text-anchor", "middle")
					.text(d.data[valueProperty]);
			});

			slices.on('mouseout', function (d, i) {
				labelHover.remove();
				circleHover.remove();
				pathHover.remove();
			});

			chart.update = function (newData) {
				console.log("updateeee");
				// Recompute the angles and rebind the data.
				slices = slices.data(pie(newData));

				// slices.enter()
				// 	.append()

				// slices
				// 	.selectAll("path")
				// 	.transition().duration(750)
				// 	.attr("d", function (d) {
				// 		console.log(d.data);
				// 		return arc(d.data[valueProperty]);
				// 	});

				slices.select('path')
					.transition().duration(750)
						.attr('fill', function (d, i) { return colorScale(d.data[valueProperty]); })
						.attr('d', arc);

				slices.exit().remove();
					// .attrTween("d", arcTween);
			};

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
