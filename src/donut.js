chartme.donut = function(data) {

	var
		  width  = 300
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, max = d3.max(data.map(function (d) { return d.value; }))
		, svg
		, dispatcher = {
			slice: d3.dispatch('click', 'mouseover')
		};

	function chart(selection) {
		selection.each(function (d, i) {

			svg = d3.select(this).append("svg")
				.data([data])
					.attr("width", width)
					.attr("height", height)
				.append("g")
					// Move the center of the chart from 0, 0 to radius, radius
					.attr("transform", "translate(" + radius + "," + radius + ")");


			var label = svg.append('text')
				.attr("text-anchor", "middle")
				;

			var color = d3.scale.linear()
				.domain([min, max])
				.range(colors);

			// This will create <path> elements using arc data.
			var arc = d3.svg.arc()
				.outerRadius(radius * 0.98)
				.innerRadius(radius * donutRate);

			var arcHover = d3.svg.arc()
				.outerRadius(radius)
				.innerRadius(radius * donutRate * 0.95);

			// This will create arc data given a list of values
			var pie = d3.layout.pie()
				.value(function (d) { return d.value; });

			var slices = svg.selectAll('g.slice')
				.data(pie)
				.enter().append('g')
					.attr('class', 'slice');

			slices.on('mouseover', function (d, i) {
				d3.select(this).select('path')
					.transition()
						.duration(200)
					.attr('d', arcHover);

				label.text(d.value + '%');
			});

			slices.on('mouseout', function (d, i) {
				d3.select(this).select('path')
					.transition()
						.duration(100)
					.attr('d', arc);

				label.text('');
			});

			// Slices.
			slices.append('path')
				.attr("stroke", "#fff")
				.attr('fill', function(d, i) { return color(d.value); })
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
					return d.data.label;
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

	return chart;
};
