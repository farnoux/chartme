(function ($) {

	$.fn.chartme = function (options) {
		var $this = $(this);
		options = $.extend($this.data('chart'), options || {});


		var chart = chartme[options.type]()
			.width($this.width())
			.height($this.height());

		if (options.type === "donut") {
			chart.labelProperty(0).valueProperty(1);
		}
		else {
			chart.x(0).y(1);
		}

		d3.select(this[0]).call(chart);

		var format = {
			rate: d3.format(".0%")
		};

		if (options.format) {
			chart.yFormat(format[options.format]);
		}

		$.each(["colors", "radiusOffset", "dispatch", "data"], function (i, property) {
			if (options[property]) {
				chart[property](options[property]);
			}
		});

		return chart;
	};

})(jQuery);