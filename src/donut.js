chartme.donut = function() {

	var
			width  = 300
		, height = 300
		, colors = ["#e6f6ff", "#98d8fd"]
		, radius
		, donutRate = 0.6
		, valueProperty = "value"
		, labelProperty = "label"
		, colorProperty
		, svg
		, vis
		, arc = d3.svg.arc()
		, colorScale
		, pieLayout
		, currentData
		;

	function init() {
		colorScale = d3.scale.linear()
			.range(colors);

		pieLayout = d3.layout.pie()
			.sort(null)
			.value(function (d) { return d[valueProperty]; });
	}

	function widthChange() {
		radius = Math.min(width, height) * 0.5;

		// Generate arc data used by <path> elements.
		arc.outerRadius(radius * 0.98)
			.innerRadius(radius * donutRate)
			;

		svg.attr("width", width);
		vis.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
	}

	function chart() {
		init();

		svg = this.append("svg")
				.attr("height", height);

		vis = svg.append("g")
				// Move the center of the chart from 0, 0 to radius, radius
				.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

		widthChange();
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

	function sliceLabel(d) {
		var angle = d.endAngle - d.startAngle;
		// approximatively, O.6 radians = 34 degrees.
		return angle > 0.6 ? d.data[labelProperty] : "";
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

	function textPosition (d) {
		return "translate(" + arc.centroid(d) + ")";
	}

	function fillColor(d) {
		if (colorProperty) {
			return d.data[colorProperty];
		}
		return colorScale(d.data[valueProperty]);
	}

	function renderChart(data) {
		var slices = vis.selectAll("g.slice")
					.data(data);

		// Create.
		var g = slices.enter()
			.append("g")
			.attr("class", "slice")
			;

		// Slice path.
		g.append("path")
			.attr("stroke", "#fff")
			.attr("fill", fillColor)
			.each(function (d) { this._current = d; })
			;

		// Slice label.
		g.append("text")
			// Center the text on its origin.
			.attr("text-anchor", "middle")
			.attr("transform", textPosition)
			.text(sliceLabel)
			;

		// Update.
		slices.select("path").transition()
			.duration(300)
			.attr("fill", fillColor)
			.attrTween("d", arcTween)
				// .attr("d", arc)
				;


		slices.select("text").transition()
			.duration(300)
			// Position the label origin to the slice's center.
			.attr("transform", textPosition)
			.text(sliceLabel)
			;

		// Remove.
		slices.exit().transition()
			.duration(300)
			.select("path")
			.attr("fill", fillColor)
			.attrTween("d", arcTween)
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

		currentData = data;

		renderChart(data);
	};


	chart.width = function(value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		if (currentData) {
			widthChange();
		}
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

	chart.colorProperty = function (value) {
		if (!arguments.length) return colorProperty;
		colorProperty = value;
		return chart;
	};

	chart.refresh = function () {
		renderChart(currentData);
		return chart;
	};


	return chart;
};
