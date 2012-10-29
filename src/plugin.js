
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
						chart.x(0).y(1);
					}
					, 'donut' : function () {
						chart.label(0).value(1);
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

