/// <reference path='typings/d3/d3.d.ts' />
'use strict';
var oribir;
(function (oribir) {
    var plot;
    (function (plot) {
        var PADDING = {
            top: 20,
            right: 30,
            bottom: 60,
            left: 80
        };
        var Plot = (function () {
            function Plot(parent, class_, max_x, max_y, title_x, title_y) {
                this._cache = [];
                this._scale_x = d3.scale.linear();
                this._scale_y = d3.scale.linear();
                this._line = d3.svg.line().x(function (d, i) {
                    return this._scale_x(i);
                }).y(function (d, i) {
                    return this._scale_y(d);
                }).interpolate('linear');
                this._axis_func_x = d3.svg.axis().scale(this._scale_x).orient('bottom');
                this._axis_func_y = d3.svg.axis().scale(this._scale_y).orient('left');
                this._parent = parent;
                this._svg = this._parent.append('svg').attr('class', 'plot ' + class_);
                var svg_height = parseInt(this._svg.style('height'));
                var panel_height = svg_height - PADDING.top - PADDING.bottom;
                this._panel = this._svg.append('g').attr('class', 'panel').attr('transform', 'translate(' + PADDING.left + ',' + PADDING.top + ')').attr('height', panel_height);
                this._panel_background = this._panel.append('rect').attr('class', 'panel_background').attr('height', panel_height);
                this._scale_x.domain([0, max_x]);
                this._scale_y.domain([0, max_y]).range([panel_height, 0]);
                this._axis_x = this._panel.append('g').attr('class', 'xaxis').attr('transform', 'translate(0,' + panel_height + ')');
                this._panel.append('g').attr('class', 'yaxis').call(this._axis_func_y);
                this._axis_title_x = this._panel.append('text').attr('text-anchor', 'middle').text(title_x);
                this._axis_title_y = this._panel.append('text').attr('text-anchor', 'middle').text(title_y).attr('transform', 'translate(-50,' + panel_height / 2 + ') rotate(-90)');
                this._path = this._panel.append('path').attr('class', 'trajectory');
                this.update_width();
            }
            Plot.prototype.update_width = function () {
                var width = parseInt(this._parent.style('width'));
                var panel_width = width - PADDING.left - PADDING.right;
                var panel_height = parseInt(this._panel.attr('height'));
                this._panel_background.attr('width', panel_width);
                this._scale_x.range([0, panel_width]);
                this._axis_x.call(this._axis_func_x);
                this._axis_title_x.attr('transform', 'translate(' + (panel_width / 2) + ',' + (panel_height + 50) + ')');
                this.path_d(this._cache);
            };
            Plot.prototype.domain = function (range) {
                this._scale_x.domain(range);
                this._axis_x.call(this._axis_func_x);
            };
            Plot.prototype.path_d = function (values, delay) {
                if (delay === void 0) { delay = 0; }
                this._cache = values;
                this._path.transition().delay(delay).ease('linear').attr('d', this._line(values));
            };
            return Plot;
        })();
        plot.Plot = Plot;
    })(plot = oribir.plot || (oribir.plot = {}));
})(oribir || (oribir = {}));
