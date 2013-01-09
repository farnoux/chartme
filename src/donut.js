chartme.donut = function() {

	var
		  element
		, width  = 300
		, height = 300
		, colors = ["#e6f6ff", "#98d8fd"]
		, radius
		, radiusOffset = 0
		, donutRate = 0.6
		, valueProperty = "value"
		, labelProperty = "label"
		, idProperty
		, svg
		, vis
		, arc = d3.svg.arc()
		, colorScale
		, pieLayout
		, currentData
		, dispatch = d3.dispatch("svgInit", "sliceEnter", "sliceUpdate", "sliceExit")
		;

	function dataId (d) {
		return d.data[(idProperty !== undefined) ? idProperty : labelProperty];
	}

	function initSvg() {
		svg = element.append("svg");
		vis = svg.append("g");

		dispatch.svgInit.call(chart, svg);

		onDimensionsChange();
	}

	function onDimensionsChange() {
		svg
			.attr("width", width)
			.attr("height", height);

		// Move the center of the chart from 0,0 to radius,radius.
		vis.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

		// If the radius has not been manually specified, calculate it from the width/height.
		radius = Math.min(width, height) * 0.5 - radiusOffset;

		// Generate arc data used by <path> elements.
		arc
			.outerRadius(radius * 0.98)
			.innerRadius(radius * donutRate)
			;
	}

	function chart() {
		// The DOM element this chart will be attach to.
		element = this;

		colorScale = d3.scale.linear()
			.range(colors);

		pieLayout = d3.layout.pie()
			.sort(null)
			.value(function (d) {
				return d[valueProperty];
			});
	}

	function sliceLabel(d) {
		var angle = d.endAngle - d.startAngle;
		// approximatively, O.6 radians = 34 degrees.
		return angle > 0.6 ? d.data[labelProperty] : "";
	}

	// Store the currently-displayed angles in this._current.
	// Then, interpolate from this._current to the new angles.
	// See http://bl.ocks.org/1346410
	function arcTween(d) {
		var i = d3.interpolate(this._current || d, d);
		this._current = d;
		// this._current = { startAngle: d.startAngle, endAngle: d.endAngle };

		return function (t) {
			return arc(i(t));
		};
	}

	function transformTween(arc, additionalTransformation) {
		additionalTransformation = additionalTransformation || "";
		return function (d) {
			var i = d3.interpolate(this._current || d, d);
			this._current = d;
			return function (t) {
				return "translate(" + arc.centroid(i(t)) + ")" + additionalTransformation;
			};
		};
	}

	function textPosition (d) {
		return "translate(" + arc.centroid(d) + ")";
	}

	function fillColor(d) {
		return colorScale(d.data[valueProperty]);
	}

	function renderChart(data) {
		if (!svg) {
			initSvg();
		}

		var slices = vis.selectAll("g.slice")
			.data(data, dataId);

		// Create.
		var g = slices.enter()
			.append("g")
			.attr("class", "slice");

		// Slice path.
		g.append("path")
			.attr("stroke", "#fff")
			.attr("fill", fillColor)
			;

		// Slice label.
		g.append("text")
			// Center the text on its origin.
			.attr("text-anchor", "middle")
			// .attr("transform", textPosition)
			;

		// Dispatch "sliceEnter" event.
		dispatch.sliceEnter.call(chart, g);

		// Update.
		var update = slices
			.transition()
			.duration(300);

		update.select("path")
			.attr("fill", fillColor)
			.attrTween("d", arcTween)
			;

		update.select("text")
			// Position the label origin to the slice's center.
			// .attr("transform", textPosition)
			.attrTween("transform", transformTween(arc))
			.each("end", function (d) {
				d3.select(this).text(sliceLabel(d));
			})
			;

		// Dispatch "sliceUpdate" event.
		dispatch.sliceUpdate.call(chart, update, transformTween);

		// Remove.
		var exit = slices.exit().remove();

		// Dispatch "sliceExit" event.
		dispatch.sliceExit.call(chart, exit);
	}

	chart.data = function (data) {
		if (!data) {
			return;
		}

		// data.forEach(function (d) {
		// 	d[valueProperty] = +d[valueProperty];
		// });

		var max = d3.max(data.map(function (d) {

			// Cast value to int.
			d[valueProperty] = +d[valueProperty];

			return d[valueProperty];
		}));

		colorScale.domain([0, max]);

		data = pieLayout(data);

		currentData = data;

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

	chart.radius = function() {
		return radius;
	};

	chart.radiusOffset = function(value) {
		if (!arguments.length) return radiusOffset;
		radiusOffset = value;
		return chart;
	};

	chart.colors = function (value) {
		if (!arguments.length) return colorScale.range();
		colorScale.range(value);
		return chart;
	};

	chart.valueProperty = function (value) {
		if (!arguments.length) return valueProperty;
		valueProperty = value;
		return chart;
	};

	chart.labelProperty = function (value) {
		if (!arguments.length) return labelProperty;
		labelProperty = value;
		return chart;
	};

	chart.idProperty = function (value) {
		if (!arguments.length) return idProperty;
		idProperty = value;
		return chart;
	};

	chart.dispatch = function (callback) {
		if (!arguments.length) return dispatch;
		callback(dispatch);
		return chart;
	};

	chart.refresh = function () {
		onDimensionsChange();
		renderChart(currentData);
		return chart;
	};


	return chart;
};
