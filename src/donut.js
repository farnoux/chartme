chartme.donut = function(data) {

	var
		  width  = 300
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, max
		, valueProperty = "value"
		, labelProperty = "label"
		, svg
		, dispatcher = {
			slice: d3.dispatch('click', 'mouseover')
		};

	function chart(selection) {
		data.forEach(function (d) {
			d[valueProperty] = +d[valueProperty];
		});

		max = d3.max(data.map(function (d) { return d[valueProperty]; }));

		selection.each(function (d, i) {

			svg = d3.select(this).append("svg")
				.data([data])
					.attr("width", width)
					.attr("height", height)
				.append("g")
					// Move the center of the chart from 0, 0 to radius, radius
					.attr("transform", "translate(" + radius + "," + radius + ")");


			var colorScale = d3.scale.linear()
				.domain([min, max])
				.range(colors);

				console.log(max);

			// This will create <path> elements using arc data.
			var arc = d3.svg.arc()
				.outerRadius(radius * 0.98)
				.innerRadius(radius * donutRate);


			// This will create arc data given a list of values
			var pie = d3.layout.pie()
				.value(function (d) { return d[valueProperty]; });

			var slices = svg.selectAll('g.slice')
				.data(pie)
				.enter().append('g')
					.attr('class', 'slice');

			var arcHover = d3.svg.arc()
				.innerRadius(radius * 0.21)
				.outerRadius(radius * donutRate * 0.99);

			// Slices.
			slices.append('path')
				.attr("stroke", "#fff")
				.attr('fill', function (d, i) { console.log(d);return colorScale(d.data[valueProperty]); })
				.attr('d', arc);

			// Slice labels.
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

	chart.on = function (eventName, handler) {
		var eventNameWithNamespace = eventName.split('.');
		dispatcher[eventNameWithNamespace[0]].on(eventNameWithNamespace[1], handler);
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
