/// <reference path="typings/d3/d3.d.ts" />
"use strict";
var oribir;
(function (oribir) {
    var plot;
    (function (plot) {
        var Plot = (function () {
            function Plot(id, title_x, title_y) {
                this._svg = d3.select("#graph").append("svg");
                this._panel = this._svg.append("g").attr("class", "panel").attr("transform", "translate(" + Plot.PADDING.left + "," + Plot.PADDING.top + ")").attr("height", parseInt(this._svg.style("height")) - Plot.PADDING.top - Plot.PADDING.bottom);
                this._panel_background = this._panel.append("rect").attr("class", "panel_background").attr("height", this._panel.attr("height"));
                this._scale_x = d3.scale.linear();
                this._scale_y = d3.scale.linear().range([this._panel.attr("height"), 0]);
                this._line = d3.svg.line().x(function (d, i) {
                    return this._scale_x(i);
                }).y(function (d, i) {
                    return this._scale_y(d);
                }).interpolate("linear");
                this._axis_x = d3.svg.axis().scale(this._scale_x).orient("bottom");
                this._axis_y = d3.svg.axis().scale(this._scale_y).orient("left");
                this._axis_title_x = this._panel.append("text").attr("text-anchor", "middle");
                this._axis_title_y = this._panel.append("text").attr("text-anchor", 'middle');
                this._path = this._panel.append("path").attr("class", "trajectory");
                this._cache = [];
                this._svg.attr("class", "plot").attr("id", id);
                this._scale_x.domain([0, 100]);
                this._scale_y.domain([0, 15]);
                var panel_height = parseInt(this._panel.attr("height"));
                this._panel.append("g").attr("class", "xaxis");
                this._panel.append("g").attr("class", "yaxis").call(this._axis_y);
                this._axis_title_x.text(title_x);
                this._axis_title_y.text(title_y).attr("transform", "translate(-50," + panel_height / 2 + ")rotate(-90)");
                this.update_width();
            }
            Plot.prototype.update_width = function () {
                var width = parseInt(d3.select("#graph").style("width"));
                var panel_width = width - Plot.PADDING.left - Plot.PADDING.right;
                var panel_height = parseInt(this._panel.attr("height"));
                this._svg.attr("width", width);
                this._panel_background.attr("width", panel_width);
                this._scale_x.range([0, panel_width]);
                d3.select(".xaxis").attr("transform", "translate(0," + panel_height + ")").call(this._axis_x);
                this._axis_title_x.attr("transform", "translate(" + (panel_width / 2) + "," + (panel_height + 50) + ")");
                this.path_d(this._cache);
            };
            Plot.prototype.domain = function (range) {
                this._scale_x.domain(range);
                d3.select(".xaxis").call(this._axis_x);
            };
            Plot.prototype.path_d = function (values, delay) {
                if (delay === void 0) { delay = 0; }
                this._cache = values;
                this._path.transition().delay(delay).ease("linear").attr("d", this._line(values));
            };
            Plot.PADDING = {
                top: 20,
                right: 30,
                bottom: 60,
                left: 80
            };
            return Plot;
        })();
        plot.Plot = Plot;
    })(plot = oribir.plot || (oribir.plot = {}));
})(oribir || (oribir = {}));
