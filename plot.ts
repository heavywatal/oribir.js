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

        private _scale_x = d3.scale.linear()
            .domain([0, 100]);
        private _scale_y = d3.scale.linear()
            .domain([0, 15])
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

        private _axis_title_x;
        private _axis_title_y;

        constructor (id:string, title_x: string, title_y: string) {
            this._svg.attr("class", "plot").attr("id", id);
            this._axis_title_x = this._panel.append("text")
                .text(title_x)
                .attr("text-anchor", "middle");
            this._axis_title_y = this._panel.append("text")
                .text(title_y)
                .attr("text-anchor", 'middle');
            this.init_svg();
        }

        domain(range: number[]) {
            this._scale_x.domain(range);
        }

        clear() {
            this._panel.selectAll("path").remove();
        }

        draw(results: number[][]) {
            var rep = results.length;
            for (var i=0; i<rep; ++i) {
                var trajectory = results[i];
                this._panel.append("path").attr("d", this._line(trajectory));
            }
        }

        animation(results: number[][]) {
            var rep = results.length;
            for (var i=0; i<rep; ++i) {
                var trajectory = results[i];
                var T = trajectory.length;
                var repl_delay = rep * T / 5 + 600 * i / rep;
                var path = this._panel.append("path");
                for (var t=0; t<=T; ++t) {
                    var part = trajectory.slice(0, t);
                    path.transition().delay(repl_delay + 23 * t).ease("linear")
                        .attr("d", this._line(part));
                }
            }
        }

        update_width() {
            var width = parseInt(d3.select("#graph").style("width"));
            this._svg.attr("width", width);
            var svg_width = parseInt(this._svg.attr("width"));
            var panel_width = svg_width - Plot.PADDING.left - Plot.PADDING.right;
            var panel_height = parseInt(this._panel.attr("height"));
            this._panel_background.attr("width", panel_width);
            this._scale_x.range([0, panel_width]);
            d3.select(".xaxis")
                .attr("transform",
                      "translate(0," + panel_height + ")")
                .call(this._axis_x);
            this._axis_title_x.attr("transform", "translate("+
                              (panel_width / 2)+","+
                              (panel_height + 50) +")");
            this._panel.selectAll("path").remove();
            //this._draw();
        }

        init_svg() {
            this.update_width();
            var svg_width = parseInt(this._svg.attr("width"));
            var panel_width = svg_width - Plot.PADDING.left - Plot.PADDING.right;
            var panel_height = parseInt(this._panel.attr("height"));

            this._panel.append("g")
                .attr("class", "xaxis")
                .attr("transform",
                      "translate(0," + this._panel.attr("height") + ")")
                .call(this._axis_x);
            this._panel.append("g")
                .attr("class", "yaxis")
                .call(this._axis_y);

            this._axis_title_y.attr("transform",
                                    "translate(-50,"+ panel_height/2 +")rotate(-90)");
        }
    }


}
