/// <reference path="typings/d3/d3.d.ts" />
"use strict";

module oribir.plot {

    export class Plot {

        static PADDING = {
            top:    20,
            right:  30,
            bottom: 60,
            left:   80
        };

        private _svg = d3.select("#graph").append("svg");
        private _panel = this._svg.append("g")
            .attr("class", "panel")
            .attr("transform",
                  "translate("+Plot.PADDING.left+","+Plot.PADDING.top+")")
            .attr("height",
                  parseInt(this._svg.style("height")) - Plot.PADDING.top - Plot.PADDING.bottom);
        private _panel_background = this._panel.append("rect")
            .attr("class", "panel_background")
            .attr("height", this._panel.attr("height"));

        private _scale_x = d3.scale.linear();
        private _scale_y = d3.scale.linear()
            .range([this._panel.attr("height"), 0]);
        private _line = d3.svg.line()
            .x(function(d, i) {return this._scale_x(i);})
            .y(function(d, i) {return this._scale_y(d);})
            .interpolate("linear");

        private _axis_x = d3.svg.axis()
            .scale(this._scale_x)
            .orient("bottom");
        private _axis_y = d3.svg.axis()
            .scale(this._scale_y)
            .orient("left");

        private _axis_title_x = this._panel.append("text")
            .attr("text-anchor", "middle");
        private _axis_title_y = this._panel.append("text")
            .attr("text-anchor", 'middle');
        private _path = this._panel.append("path")
            .attr("class", "trajectory");
        private _cache: number[] = [];

        constructor (id:string, title_x: string, title_y: string) {
            this._svg.attr("class", "plot").attr("id", id);
            this._scale_x.domain([0, 100]);
            this._scale_y.domain([0, 15]);

            var panel_height = parseInt(this._panel.attr("height"));
            this._panel.append("g").attr("class", "xaxis");
            this._panel.append("g").attr("class", "yaxis")
                .call(this._axis_y);
            this._axis_title_x.text(title_x);
            this._axis_title_y.text(title_y)
                .attr("transform",
                      "translate(-50,"+ panel_height/2 +")rotate(-90)");
            this.update_width();
        }

        update_width() {
            var width = parseInt(d3.select("#graph").style("width"));
            var panel_width = width - Plot.PADDING.left - Plot.PADDING.right;
            var panel_height = parseInt(this._panel.attr("height"));
            this._svg.attr("width", width);
            this._panel_background.attr("width", panel_width);
            this._scale_x.range([0, panel_width]);
            d3.select(".xaxis")
                .attr("transform",
                      "translate(0," + panel_height + ")")
                .call(this._axis_x);
            this._axis_title_x.attr("transform", "translate("+
                              (panel_width / 2)+","+
                              (panel_height + 50) +")");
            this.path_d(this._cache);
        }

        domain(range: number[]) {
            this._scale_x.domain(range);
            d3.select(".xaxis").call(this._axis_x);
        }

        path_d(values: number[], delay: number = 0) {
            this._cache = values;
            this._path.transition().delay(delay).ease("linear")
                .attr("d", this._line(values));
        }
    }
}
