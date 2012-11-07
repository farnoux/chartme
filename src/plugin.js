(function ($) {

	$.fn.chartme = function (options) {
		var $this = $(this);
		options = $.extend($this.data('chart'), options || {});


		var chart = chartme[options.type]()
			.width($this.width())
			.height($this.height());

		if (options.type === "donut") {
			chart.label(0).value(1);
		}
		else {
			chart.x(0).y(1);
		}

		d3.select(this[0]).call(chart);

		var format = {
			rate: d3.format(".0%")
		};

		if (options.format) {
			console.log(format[options.format]);
			chart.yFormat(format[options.format]);
		}



		if(options.data) {
			chart.data(options.data);
		}

		return chart;
	};

})(jQuery);