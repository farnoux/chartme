(function(window, undefined){
var chartme = window.chartme = { version: '0.0.1' };
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
		, guideline
		, xScale
		, yScale
		, line
		;

		// see http://bl.ocks.org/3310233

	function mousemove(d) {
		var mouseX = d3.mouse(this)[0] - margin.left
			, mouseY = d3.mouse(this)[1] - margin.top;

		var x = xScale.invert(mouseX);
		console.log(x);

		guideline
			.attr("x1", mouseX)
			.attr("x2", mouseX)
			// .attr("y1", mouseY)
			;
				// .attr("opacity", originOpacity)
	}

	function mouseenter(d) {
		// console.log("enter");
		guideline.style("display", "inline");
	}
	function mouseexit(d) {
		// console.log("exit");
		guideline.style("display", "none");
	}


	function chart(selection) {
		selection.each(function (d, i) {

			xScale = d3.scale.linear()
				.domain([0, data.length - 1])
				.range([0, width]);

			yScale = d3.scale.linear()
				.domain([0, max])
				.range([height, 0])
				.nice()
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

			// Add y axis.
			var gy = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + '0' + "," + margin.top + ")")
				.call(yAxis);

			svg.selectAll("text")
				.attr("x", 0)
				.attr("dy", -2);

			// svg.on("mouseover", mouseenter)
			// 	.on("mouseout", mouseexit)
			// 	.on("mousemove", mousemove);

			svg = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			line = d3.svg.line()
				.x(function (d, i) { return xScale(i); })
				.y(function (d) { return yScale(d.value); })
				.interpolate('cardinal');

			var path = svg.append("path")
				.attr("class", "line")
				.attr("d", line);

			svg.selectAll(".dot")
					.data(data)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("cx", line.x())
					.attr("cy", line.y())
					.attr("r", 3.5);


			guideline = svg.append("line")
				.attr("class", "guideline")
				.attr("y1", 0)
				.attr("y2", height)
				;

			$("svg .dot").tooltip({
				 title: function () {
					return '' + this.__data__.value;
				}
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


	return chart;
};
/*global chartme:true, d3:true*/
chartme.bar = function () {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 50 }
		, width  = 600
		, height = 300
		, visWidth
		, visHeight
		, colors = [["#ecf0d1", "#d8e0a0", "#afc331"], ["#e6cfec", "#cd9dd8", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		// , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		, xProperty = 'x'
		, yProperty = 'y'
		, yMax
		, svg
		, vis
		, yAxis
		, xScale = d3.scale.ordinal()
		, yScale = d3.scale.linear()
		, colorScale = d3.scale.linear()
		, stackLayout
		, y0 = function (d) { return yScale(d.y0) ; }
		, y1 = function (d) { return yScale(d.y + d.y0) ; }
		, currentData
		;


	function init() {
		// Init metrics.
		// visWidth  = width - margin.left - margin.right;
		visHeight = height - margin.top - margin.bottom;

		// Init scales.
		yScale.range([visHeight, 0]);

		// Init layout.
		stackLayout = d3.layout.stack()
			.x(function (d) { return d[xProperty]; })
			.y(function (d) { return d[yProperty]; })
			;

		// Init axis.
		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("right")
			.ticks(2)
			.tickSubdivide(true)
			;
	}

	function widthChange() {
		visWidth  = width - margin.left - margin.right;

		svg.attr("width", width);
		vis.attr("width", visWidth);

		xScale.rangeBands([0, visWidth], 0.15);
		yAxis.tickSize(width);
	}

	function chart() {
		init();

		svg = this.append("svg")
				// .attr("width", width)
				.attr("height", height)
				;

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			;

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + 0 + "," + margin.top + ")")
			;

		vis = svg.append("g")
			.attr("class", "vis")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			// .attr("width", visWidth)
			.attr("height", visHeight)
			;

		widthChange(width);
	}


	function renderChart(data) {
		var layers = vis.selectAll("g.layer")
			.data(data)
			;

		layers.enter().append("g")
			.attr("class", "layer")
			.style("fill", function (d, i) { return colors[i][1]; })
			;

		layers.exit().remove();

		var bars = layers.selectAll(".bar")
			.data(function (d) { return d; });

		bars.enter().append("rect")
			.attr("class", "bar")
			// .attr("fill", function (d, i) {
			// 	return this.parentNode.__data__.colorScale(0);
			// })
			.attr("x", function (d, i) { return xScale(i); })
			.attr("width", xScale.rangeBand())
			.attr("y", yScale(0))
			.attr("height", 0)
			;

		bars.transition()
			.duration(300)
			.attr("x", function (d, i) { return xScale(i); })
			.attr("width", xScale.rangeBand())
			.attr("y", y1)
			.attr("height", function (d) { return y0(d) - y1(d); })
			;

		bars.exit().remove();
	}

	function renderAxis(data) {
		var xAxis
			, x
			, xTick
			, maxTick = 8
			, axisData = data[0]
			, tickEachIndex = 1
			;

		if (axisData.length > maxTick) {
			tickEachIndex = Math.ceil(axisData.length / maxTick);
			axisData = axisData.filter(function (d, i) { return !(i % tickEachIndex); });
		}

		// Add x axis.
		xAxis = svg.select(".x.axis")
			.selectAll("g")
			.data(axisData)
			;

		x = function (d, i) { return xScale(i * tickEachIndex) + xScale.rangeBand() * 0.5; };

		xTick = xAxis.enter().append("g")
			;

		xTick.append("line")
			.attr("class", "tick")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", 0)
			.attr("y2", 5)
			;

		xTick.append("text")
			.attr("x", x)
			.attr("dy", 16)
			.attr("text-anchor", "middle")
			.text(function (d) { return d[xProperty]; })
			;

		xAxis.select("line").transition()
			.duration(300)
			.attr("x1", x)
			.attr("x2", x)
			;

		xAxis.select("text").transition()
			.duration(300)
			.attr("x", x)
			;

		// Add y axis.
		svg.select(".y.axis")
			// .transition()
				// .delay(1000)
				// .duration(300)
				.call(yAxis)
				;

		// Position y axis labels.
		svg.selectAll(".y.axis text")
			.attr("x", 0)
			.attr("dy", -2)
			;

		// var transition = svg.transition().duration(750),
		// 		delay = function(d, i) { return i * 50; };

		// transition.selectAll(".bar")
		// 		.delay(delay)
		// 		.attr("x", function (d) { return x0(d.letter); });

		// transition.select(".x.axis")
		// 		.call(xAxis)
		// 	.selectAll("g")
		// 		.delay(delay);
	}

	function yMaxChange(max) {
		yScale.domain([0, max]);
		colorScale.domain([0, max]);
	}


	chart.data = function (data) {
		if (!data) {
			return chart;
		}

		var max;

		// Force values to be integer.
		data.forEach(function (d) {
			d.forEach(function (d) {
				d[yProperty] = +d[yProperty];
			});
		});

		// Apply the stack layout function on the data.
		data = stackLayout(data);

		// If yMax has been set manually use it, otherwise calculate it from the data.
		if (yMax) {
			max = yMax;
		}
		else {
			max = d3.max(data, function (d) {
				return d3.max(d, function (d) {
					return d.y + d.y0;
				});
			});
		}

		yMaxChange(max);

		// Update domain scales with the new data.
		xScale.domain(d3.range(0, data[0].length));

		currentData = data;

		// Render chart and axis.
		renderChart(data);
		renderAxis(data);

		return chart;
	};


	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		if (currentData) {
			widthChange();
		}
		return chart;
	};

	chart.height = function (value) {
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

	chart.yMax = function (value) {
		if (!arguments.length) return yMax;
		yMax = value;
		return chart;
	};

	chart.yAxis = function () {
		return yAxis;
	};

	chart.refresh = function () {
		renderChart(currentData);
		renderAxis(currentData);
		return chart;
	};

	return chart;
};/*global chartme:true, d3:true*/
chartme.hbar = function () {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, visWidth
		, visHeight
		, colors = [["#e6f6ff", "#98d8fd"], ["#e6cfec", "#9632b1"], ["#ecf0d1", "#afc331"]]
		// , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
		, xProperty = 'x'
		, yProperty = 'y'
		, minRangeBand = 50
		, yMax
		, svg
		, vis
		, xAxis
		, yAxis
		, xScale = d3.scale.ordinal()
		, yScale = d3.scale.linear()
		, colorScale = d3.scale.linear()
		, stackLayout
		, y0 = function (d) { return yScale(d.y0) ; }
		, y1 = function (d) { return yScale(d.y + d.y0) ; }
		, currentData
		;

	function init() {
		// Init metrics.
		visHeight = height - margin.top - margin.bottom;

		// Init layout.
		stackLayout = d3.layout.stack()
			.x(function (d) { return d[xProperty]; })
			.y(function (d) { return d[yProperty]; })
			;

		// Init axis.
		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("bottom")
			.ticks(2)
			.tickSize(visHeight)
			.tickSubdivide(true)
			;
	}

	function widthChange() {
		visWidth  = width - margin.left - margin.right;

		svg.attr("width", width);
		vis.attr("width", visWidth);

		yScale.range([visWidth, 0]);

		// xScale.rangeBands([0, visWidth], 0.15);
		// yAxis.tickSize(width);
	}

	function chart() {
		init();

		svg = this.append("svg")
				.attr("height", height)
				;

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			;

		vis = svg.append("g")
			.attr("class", "vis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			.attr("height", visHeight)
			;

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
			;

		widthChange();
	}

	function dataKey (d) {
		return d[xProperty];
	}

	function barY (d, i) {
		return xScale(i);
	}


	function renderChart(data) {

		var layers = vis.selectAll("g.layer")
			.data(data)
			;

		layers.enter().append("g")
			.attr("class", "layer")
			.style("fill", function (d, i) { return colors[i][1]; })
				// return colorScale.range(colors[i])(yMax * 0.75);
				// return colors[i+1];
			// })
			;

		layers.exit().remove();

		var bars = layers.selectAll(".bar")
			.data(function (d) { return d; }, dataKey);

		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", 0)
			.attr("width", 0)
			.attr("height", xScale.rangeBand())
			.attr("y", barY)
			;

		bars.transition()
			.duration(200)
			.attr("x", y0)
			.attr("width", function (d) { return y1(d) - y0(d); })
			.attr("height", xScale.rangeBand())
			.attr("y", barY)
			;

		bars.exit().remove();
	}

	function renderAxis(data) {
		// Add x axis.
		var xAxis
			, x
			, xTick
			;

		// Add x axis.
		xAxis = svg.select(".x.axis")
			.selectAll("g")
			.data(data[0], dataKey)
			;

		x = function (d, i) { return xScale(i) + xScale.rangeBand() * 0.5; };

		xTick = xAxis.enter()
			.append("g");

		xTick.append("text")
			.attr("y", x)
			.attr("dx", 4)
			.attr("dy", 4)
			.attr("text-anchor", "left")
			.text(function (d) { return d[xProperty]; })
			;

		xAxis.select("text").transition()
			.duration(200)
			.attr("y", x);

		xAxis.exit().remove();

		// Add y axis.
		svg.select(".y.axis")
			.call(yAxis)
			;

		// Position y axis labels.
		svg.selectAll(".y.axis text")
			.attr("y", height - margin.bottom)
			.attr("dy", -5)
			;
	}

	function yMaxChange(max) {
		yScale.domain([max, 0]);
		colorScale.domain([0, max]);
	}


	chart.data = function (data) {
		if (!data) {
			return chart;
		}

		var max;

		// Force values to be integer.
		data.forEach(function (d) {
			d.forEach(function (d) {
				d[yProperty] = +d[yProperty];
			});
		});

		data = stackLayout(data);

		// If yMax has been set manually use it, otherwise calculate it from the data.
		if (yMax) {
			max = yMax;
		}
		else {
			max = d3.max(data, function (d) {
				return d3.max(d, function (d) {
					return d.y + d.y0;
				});
			});
		}

		yMaxChange(max);

		// Update domain scales with the new data.
		xScale.domain(d3.range(0, data[0].length));

		xScale.rangeBands([-visHeight, 0], 0.15);

		if (xScale.rangeBand() > minRangeBand) {
			xScale.rangeBands([-minRangeBand * 1.15 * data[0].length, 0], 0.15);
		}

		currentData = data;

		// Render chart and axis.
		renderChart(data);
		renderAxis(data);

		return chart;
	};


	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value ? value : width;
		if (currentData) {
			widthChange();
		}
		return chart;
	};

	chart.height = function (value) {
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

	chart.minRangeBand = function (value) {
		if (!arguments.length) return minRangeBand;
		minRangeBand = value;
		return chart;
	};

	chart.yMax = function (value) {
		if (!arguments.length) return yMax;
		yMax = value;
		return chart;
	};

	chart.yAxis = function () {
		return yAxis;
	};

	chart.refresh = function () {
		renderChart(currentData);
		renderAxis(currentData);
		return chart;
	};


	return chart;
};})(window);