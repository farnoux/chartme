(function(window, undefined){
var chartme = window.chartme = { version: '0.0.1' };
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

		radius = Math.min(width, height) * 0.5;

		selection.each(function (d, i) {

			svg = d3.select(this).append("svg")
					.attr("width", width)
					.attr("height", height)
				.append("g")
					// Move the center of the chart from 0, 0 to radius, radius
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


			var colorScale = d3.scale.linear()
				.range(colors);

			// Generate arc data used by <path> elements.
			var arc = d3.svg.arc()
				.outerRadius(radius * 0.98)
				.innerRadius(radius * donutRate);

			var pie = d3.layout.pie()
				.sort(null)
				.value(function (d) { return d[valueProperty]; });


			// Store the currently-displayed angles in this._current.
			// Then, interpolate from this._current to the new angles.
			// See http://bl.ocks.org/1346410
			function arcTween(a) {
				var i = d3.interpolate(this._current, a);
				this._current = i(0);
				return function(t) {
					return arc(i(t));
				};
			}


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

			chart.update = function (data) {
				if (!data) {
					return;
				}

				data.forEach(function (d) {
					d[valueProperty] = +d[valueProperty];
				});

				max = d3.max(data.map(function (d) { return d[valueProperty]; }));

				colorScale.domain([min, max]);

				var slices = svg.selectAll('g.slice')
					.data(pie(data));

				// Create.
				slices.enter().append('g')
					.attr('class', 'slice')
					// Slice path.
					.append('path')
						.attr("stroke", "#fff")
						.attr('fill', function (d, i) { return colorScale(d.data[valueProperty]); })
						// .attr('d', arc)
					.transition()
						.duration(750)
						// .attrTween("d", arcTween)
						.each(function (d) { this._current = d; })
						;

				// Update.
				slices.select('path').transition()
					.duration(750)
					.attr('fill', function (d, i) { return colorScale(d.data[valueProperty]); })
					.attrTween("d", arcTween)
						// .attr('d', arc)
						;

				// Remove.
				slices.exit().transition()
					.duration(750)
					.select('path')
					.attr('fill', function (d, i) { return colorScale(d.data[valueProperty]); })
					.attrTween("d", arcTween)
					// .attr("fill", "red")
					.remove()
					;
			};

			chart.update(data);
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
chartme.bar = function(data) {

	var
			margin = { top: 20, right: 20, bottom: 20, left: 20 }
		, width  = 600
		, height = 300
		, colors = ["#ecf0d1", "#afc331"]
		, xInputFormat = d3.time.format("%Y%m%d")
		, xOutputFormat = d3.time.format("%d-%m-%Y")
		, xProperty = 'x'
		, yProperty = ['y']
		, radius = 150
		, donutRate = 0.6
		, min = 0
		, yMax
		, svg
		, guideline
		, xScale
		, yScale
		, colorScale
		, bar
		;

	function render(data, yProperty) {

		var bars = svg.select(".bars").selectAll(".bar" + yProperty)
			.data(data);

		bars.enter().append("rect")
			.attr("class", "bar" + yProperty)
			.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
			.attr("width", xScale.rangeBand())
			.attr("y", function (d, i) { return yScale(d[yProperty]); })
			.attr("height", function (d) { return height - margin.top - margin.bottom - yScale(d[yProperty]) + 4; })
			.attr("x", function (d, i) { return xScale(i); })
			.each(function (d) { this.__data__.chart = chart; })
			;

		bars.transition()
			.duration(300)
			.attr("y", function (d, i) { return yScale(d[yProperty]); })
			.attr("height", function (d) { return height - margin.top - margin.bottom - yScale(d[yProperty]) + 4; })
			.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
			;

		bars.exit().remove();
	}

	function chart(selection) {
		// width = width - margin.left - margin.right;
		// height = height - margin.top - margin.bottom;

		selection.each(function (d, i) {

			xScale = d3.scale.ordinal()
				.rangeBands([0, width - margin.left - margin.right], 0.15);

			var xAxisScale = d3.time.scale()
				.range([0, (width - margin.left - margin.right) -10 ])
				;

			yScale = d3.scale.linear()
				.range([height - margin.top - margin.bottom, 0])
				.nice()
				;


			// var xTimeScale = d3.time.scale()
			// 	.domain(d3.extent(data, function (d) { return d[xProperty]; }))
			// 	.range([0, width]);

			colorScale = d3.scale.linear()
				.range(colors);


			var xAxis = d3.svg.axis()
				.scale(xAxisScale)
				.orient("bottom")
				// .ticks(6)
				// .ticks(xAxisScale.ticks(d3.time.days, 1))
				.tickSize(20)
				.tickFormat(function (d) { return xOutputFormat(d); })
				;

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("right")
				.ticks(4)
				.tickSize(width)
				.tickSubdivide(true)
				;

			svg = d3.select(this).append("svg")
				// .datum(data)
					.attr("width", width)
					.attr("height", height)
					;

			svg.append("g")
				.attr("class", "bars")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				;

			function updateAxis() {
				// Add x axis.
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
					.call(xAxis)
					;

				svg.selectAll(".x.axis text")
					.attr("y", 10)
					.attr("text-anchor", "start")
					.attr("dx", 4)
					;

				// Add y axis.
				svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + 0 + "," + margin.top + ")")
					.call(yAxis);

				// Position y axis labels.
				svg.selectAll(".y.axis text")
					.attr("x", 0)
					.attr("dy", -2);
			}

			chart.update = function update (data) {
				if (!data) {
					return;
				}

				data.forEach(function (d) {
					d[xProperty] = xInputFormat.parse(d[xProperty]);
					d[yProperty] = +d[yProperty];
				});

				yMax = d3.max(data.map(function (d) {
					return d[yProperty[0]] + d[yProperty[1]];
					return yProperty.reduce(function (a, b) {
						return d[a] + d[b];
					});
				}));

				var xValues = data.map(function (d) { return d[xProperty]; });

				// xScale.domain(d3.range(0, data.length));
				// console.log(data.map(function (d) { return d[xProperty]; }));
				xScale.domain(xValues);
				// xAxisScale.domain(xValues.filter(function (d, i) { return i % 4; }));
				xAxisScale.domain(d3.extent(xValues));
				// xAxisScale.domain(xValues);

				yScale.domain([0, yMax]);
				colorScale.domain([min, yMax]);

				// xTimeScale.domain(d3.extent(data, function (d) { return d[xProperty]; }));

				updateAxis();

				yProperty.forEach(function (value) {
					console.log("y:"+ value);
					render(data, value);
				});


						// var transition = svg.transition().duration(750),
		// 		delay = function(d, i) { return i * 50; };

		// transition.selectAll(".bar")
		// 		.delay(delay)
		// 		.attr("x", function(d) { return x0(d.letter); });

		// transition.select(".x.axis")
		// 		.call(xAxis)
		// 	.selectAll("g")
		// 		.delay(delay);
			};

			chart.update(data);

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
		yProperty = value.forEach ? value : [value];
		return chart;
	};

	chart.xInputFormat = function (value) {
		if (!arguments.length) return xInputFormat;
		xInputFormat = value;
		return chart;
	};

	chart.xOutputFormat = function (value) {
		if (!arguments.length) return xOutputFormat;
		xOutputFormat = value;
		return chart;
	};

	return chart;
};chartme.hbar = function(data) {

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

		selection.each(function (d, i) {

			xScale = d3.scale.ordinal()
				.rangeRoundBands([0, width], 0.15);

			yScale = d3.scale.linear()
				.range([height, 0])
				.nice()
				;


			var xTimeScale = d3.time.scale()
				.domain(d3.extent(data, function (d) { return d[xProperty]; }))
				.range([0, width]);

			var colorScale = d3.scale.linear()
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



			// see http://stackoverflow.com/questions/10727892/how-to-center-the-bootstrap-tooltip-on-an-svg
			$("svg .bar").tooltip({
				  html: true
				, title: function () {
					var d = this.__data__;
					return '<b>' + d[yProperty] + '</b><br>' + outputDateFormat(d[xProperty]);
				}
			});


			chart.update = function update (data) {
				if (!data) {
					return;
				}

				data.forEach(function (d) {
					d[xProperty] = inputDateFormat.parse(d[xProperty]);
					d[yProperty] = +d[yProperty];
				});

				max = d3.max(data.map(function (d) { return d[yProperty]; }));

				xScale.domain(d3.range(0, data.length));
				yScale.domain([0, max]);
				colorScale.domain([min, max]);

				var bars = svg.selectAll(".bar")
					.data(data);

				bars.enter().append("rect")
					.attr("class", "bar")
					.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
					.attr("width", xScale.rangeBand())
					.attr("y", function (d, i) { return yScale(d[yProperty]); })
					.attr("height", function (d) { return height - yScale(d[yProperty]) + 4; })
					.attr("x", function (d, i) { return xScale(i); })
					;

				bars.transition()
					.duration(300)
					.attr("y", function (d, i) { return yScale(d[yProperty]); })
					.attr("height", function (d) { return height - yScale(d[yProperty]) + 4; })
					.attr('fill', function (d, i) { return colorScale(d[yProperty]); })
					;

				bars.exit().remove();
			};

			chart.update(data);

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
if ($) {
	$.fn.chartme = function (option) {
		// return this.each(function () {
				var
					  $this = $(this)
					, chartData = $this.data('chart');

				var chart = chartme[chartData.type](chartData.data || [])
					.width($this.width())
					.height($this.height());

				var doWithChart = {
					  'bar' : function (chart) {
						chart.x(0).y(chartData.stack ? [1,2] : 1);
						// if (chartData.stack) {
						// chart.stack().colors().y(2);
						// }
					}
					, 'donut' : function () {
						chart.label(0).value(1);
					}
					, 'hbar' : function (chart) {
						chart.x(0).y(1);
					}
				};

				doWithChart[chartData.type](chart);

				d3.select(this[0]).call(chart);
				return chart;
		// });
	};
}

$.fn.tooltip.Constructor.prototype.getPosition = function (inside) {
		var el = this.$element[0]
		var width, height
		if ('http://www.w3.org/2000/svg' === el.namespaceURI) {
				var bbox = el.getBBox()
				width = bbox.width
				height = bbox.height
		} else {
				width = el.offsetWidth
				height = el.offsetHeight
		}
	return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
		width: width
	, height: height
	})
};

})(window);