/// <reference path='typings/tsd.d.ts' />
'use strict';

module oribir.plot {

    var PADDING = {
        top:    20,
        right:  30,
        bottom: 60,
        left:   80
    };

    export class Plot {
        private _parent;
        private _svg;
        private _panel;
        private _panel_background;
        private _axis_x;
        private _axis_title_x;
        private _axis_title_y;
        private _path;
        private _cache: number[] = [];
        private _scale_x = d3.scale.linear();
        private _scale_y = d3.scale.linear();
        private _line = d3.svg.line()
            .x(function(d, i) {return this._scale_x(i);})
            .y(function(d, i) {return this._scale_y(d);})
            .interpolate('linear');
        private _axis_func_x = d3.svg.axis()
            .scale(this._scale_x)
            .orient('bottom');
        private _axis_func_y = d3.svg.axis()
            .scale(this._scale_y)
            .orient('left');

        constructor (parent, class_: string, max_x: number, max_y: number,
                     title_x: string, title_y: string) {
            this._parent = parent;
            this._svg = this._parent.append('svg')
                .attr('class', 'plot ' + class_);
            var svg_height = parseInt(this._svg.style('height'));
            var panel_height = svg_height - PADDING.top - PADDING.bottom;
            this._panel = this._svg.append('g')
                .attr('class', 'panel')
                .attr('transform',
                      'translate('+PADDING.left+','+PADDING.top+')')
                .attr('height', panel_height);
            this._panel_background = this._panel.append('rect')
                .attr('class', 'panel_background')
                .attr('height', panel_height);
            this._scale_x.domain([0, max_x]);
            this._scale_y.domain([0, max_y])
                .range([panel_height, 0]);
            this._axis_x = this._panel.append('g')
                .attr('class', 'xaxis')
                .attr('transform', 'translate(0,' + panel_height + ')');
            this._panel.append('g')
                .attr('class', 'yaxis')
                .call(this._axis_func_y);
            this._axis_title_x = this._panel.append('text')
                .attr('text-anchor', 'middle')
                .text(title_x);
            this._axis_title_y = this._panel.append('text')
                .attr('text-anchor', 'middle')
                .text(title_y)
                .attr('transform',
                      'translate(-50,'+ panel_height/2 +') rotate(-90)');
            this._path = this._panel.append('path')
                .attr('class', 'trajectory');
            this.update_width();
        }

        update_width() {
            var width = parseInt(this._parent.style('width'));
            if (isNaN(width)) return;
            var panel_width = width - PADDING.left - PADDING.right;
            var panel_height = parseInt(this._panel.attr('height'));
            this._panel_background.attr('width', panel_width);
            this._scale_x.range([0, panel_width]);
            this._axis_x.call(this._axis_func_x);
            this._axis_title_x.attr('transform', 'translate('+
                              (panel_width / 2)+','+
                              (panel_height + 50) +')');
            this.path_d(this._cache);
        }

        domain(range: number[]) {
            this._scale_x.domain(range);
            this._axis_x.call(this._axis_func_x);
        }

        path_d(values: any, delay: number = 0) {
            this._cache = values;
            this._path.transition().delay(delay).ease('linear')
                .attr('d', this._line(values));
        }
    }
}
