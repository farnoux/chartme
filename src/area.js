/*global chartme:true, d3:true*/
chartme.area = function () {

    var
        margin = { top: 20, right: 20, bottom: 20, left: 30 },
    // , marginLayer = { top: 15, right: 0, bottom: 0, left: 34}
        width = 600,
        height = 300,
        visWidth,
        visHeight,
        colors = [
            ['#e6cfec', '#d9efff', '#9632b1'],
            ['#ecf0d1', '#d8e0a0', '#afc331'],
            ['#e6f6ff', '#98d8fd']
        ],
    // , colors = [["#afc331", "#afc331"], ["#9632b1", "#9632b1"], ["#e6f6ff", "#98d8fd"]]
         xProperty = 'x',
         yProperty = 'y',
         yMax,
         svg,
         vis,
         yAxis,
         xScale = d3.scale.ordinal(),
         yScale = d3.scale.linear(),
         colorScale = d3.scale.linear(),
         stackLayout,
         y0 = function (d) {
            return yScale(d.y0);
        },
        y1 = function (d) {
            return yScale(d.y + d.y0);
        },
        currentData,
        interpolation = 'linear',
        dotRadius = 6,
        transitionDuration = 300;



    function init() {

        // Init metrics.
        // visWidth  = width - margin.left - margin.right;
        visHeight = height - margin.top - margin.bottom;

        // Init scales.
        yScale.range([visHeight, 0]);

        // Init layout.
        stackLayout = d3.layout.stack()
            .x(function (d) {
                return d[xProperty];
            })
            .y(function (d) {
                return d[yProperty];
            })
        ;

        // Init axis.
        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('right')
            .ticks(2)
            .tickSubdivide(true)
        ;
    }

    function widthChange() {
        visWidth = width - margin.left - margin.right;

        svg.attr('width', width);
        vis.attr('width', visWidth);

        xScale.rangeBands([0, visWidth], 0.15);
        yAxis.tickSize(width);
    }

    function chart() {
        init();

        svg = this.append('svg')
            .attr('height', height)
        ;

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + margin.left + ',' + (height - margin.top) + ')')
        ;

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(0 ,' + margin.top + ')')
        ;

        vis = svg.append('g')
            .attr('class', 'vis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('height', visHeight)
        ;

        widthChange(width);
    }

    function renderDots(layers) {

        var dot = layers.selectAll('.dot')
            .data(function (d) {
                return d;
            });

        dot.enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', function (d, i) {
                return xScale(i);
            })
            .attr('cy', function () {
                return yScale(0);
            })
            .attr('r', dotRadius);

        dot.transition()
            .duration(transitionDuration)
            .attr('cx', function (d, i) {
                return xScale(i);
            })
            .attr('cy', y1);

        //   dot.transition()
        //   .duration(300)
        //   .attr("cx", function (d, i) { return xScale(i); });
        //   .attr("cy", function (d) { return y1(d); });

        dot.exit().remove();
    }

    function renderRect(layers, data) {

        var infoG = layers.selectAll('.info')
                .data(function (d) {
                    return d;
                })
            ;

        infoG.enter().append('g')
            .attr('class', 'info')
            .attr('transform', 'translate(0 ,' + margin.top + ')')
            .attr('x', function (d, i) {
                return xScale(i);
            })
            .attr('y', 0)
            .attr('height', visHeight)
        ;

        var width = Math.min(xScale.rangeBand(), 60);

        infoG.append('rect')
            .attr('x', function (d, i) {
                return xScale(i) - width * .5;
            })
            .attr('y', 0)
            .attr('class', 'hover-container')
            .attr('width', width)
            .attr('height', visHeight)
            .attr('fill', 'transparent')
        ;

        renderLabel(layers, data, infoG);

        renderVerticalLines(layers, data, infoG);

        infoG.exit().remove();
    }

    function renderVerticalLines(layers, data, infoG) {

        infoG.append('line')
            .attr('x1', function (d, i) {
                return xScale(i);
            })
            .attr('x2', function (d, i) {
                return xScale(i);
            })
            .attr('y1', 0)
            .attr('y2', visHeight)
            .attr('transform', 'translate(0 ,' + -margin.top + ')')
        ;
    }

    function renderLabel(layers, data, infoG) {
        var top = function (d) {
            return yScale(d.y + d.y0) - 20;
        };

        infoG.append('rect')
            .attr('y', top)
            .attr('x', function (d, i) {
                return xScale(i);
            })
            .attr('class', 'label-container')
            .attr('height', '30')
            .attr('transform', 'translate(10,' + -margin.top + ')')
            .attr('rx', 4)
            .attr('ry', 4)
        ;

        var label = infoG.append('text')
                .attr('y', top)
                .attr('dx', function (d, i) {
                    return xScale(i);
                })
                .attr('dy', 0)
                .attr('class', 'labelText')
                .attr('text-anchor', 'left')
                .html(function (d, i) {
                    return d[1];
                })
                .attr('transform', 'translate(20, 0)')
                .each(function (d) {
                    labelWidth = this.getBBox().width + margin.left;
                })
            ;
        label.append('tspan');

        $.each(label[0], function (i, elem) {
            $(elem).setLabel()
        });
    }

    function renderLines(layers, data) {

        var line = d3.svg.line()
            .interpolate(interpolation)
            .x(function (d, i) {
                return xScale(i);
            })
            .y(function () {
                return yScale(0);
            });

        var lineUpdate = d3.svg.line()
            .interpolate(interpolation)
            .x(function (d, i) {
                return xScale(i);
            })
            .y(function (d) {
                return y1(d);
            });


        var lines = layers.selectAll('.line')
            .data(data);

        lines.enter()
            .append('path')
            .attr('class', 'line')
            .attr('d', line);

        lines.transition()
            .duration(transitionDuration)
            .attr('d', lineUpdate);

        lines.exit().remove();
    }

    function renderArea(layers, data) {

        var area = d3.svg.area()
            .interpolate(interpolation)
            .x(function (d, i) {
                return xScale(i);
            })
            .y0(function () {
                return yScale(0);
            })
            .y1(function () {
                return yScale(0);
            })
        ;


        var areaUpdate = d3.svg.area()
            .interpolate(interpolation)
            .x(function (d, i) {
                return xScale(i);
            })
            .y0(y0)
            .y1(y1)
        ;


        var areas = layers.selectAll('.area')
            .data(data)
        ;
        // .data(function (d) { return d; });


        areas.enter().append('path')
            .attr('class', 'area')
            .attr('d', area);

        areas.transition()
            .duration(transitionDuration)
            .attr('d', areaUpdate);

        areas.exit().remove();
    }

    function renderChart(data) {

        var layers = vis.selectAll('g.layer')
            .data(data)
        ;

        layers.enter().append('g')
            .attr('class', 'layer')
            .attr('transform', 'translate( ' + xScale.rangeBand() * 0.5 + ' , 0)')
        ;

        layers.exit().remove();

        renderArea(layers, data);
        renderLines(layers, data);
        renderRect(layers, data);
        renderDots(layers, data);
    }

    function renderAxis(data) {
        var xAxis,
            x,
            xTick,
            maxTick = 8,
            axisData = data[0],
            tickEachIndex = 1;


        if (axisData.length > maxTick) {
            tickEachIndex = Math.ceil(axisData.length / maxTick);
            axisData = axisData.filter(function (d, i) {
                return !(i % tickEachIndex);
            });
        }


        // Add x axis.
        xAxis = svg.select('.x.axis')
            .selectAll("g")
            .data(axisData)
        ;

        x = function (d, i) {
            return xScale(i * tickEachIndex) + xScale.rangeBand() * 0.5;
        };

        xTick = xAxis.enter().append('g')
        ;

        xTick.append('line')
            .attr('class', 'tick')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', 5)
        ;

        xTick.append('text')
            .attr('x', x)
            .attr('dy', 16)
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d[xProperty];
            })
        ;

        xAxis.select('line').transition()
            .duration(transitionDuration)
            .attr('x1', x)
            .attr('x2', x)
        ;

        xAxis.select('text').transition()
            .duration(transitionDuration)
            .attr('x', x)
        ;

        // Add y axis.
        svg.select('.y.axis')
            // .transition()
            //  .delay(1000)
            //  .duration(transitionDuration)
            .call(yAxis)
        ;

        // Position y axis labels.
        svg.selectAll('.y.axis text')
            .attr('x', 0)
            .attr('dy', -2)
        ;

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
};
