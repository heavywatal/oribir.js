/// <reference path='typings/tsd.d.ts' />
'use strict';

module oribir.graphics {

    export class Bird {
        private _g;
        constructor(field,
                    forewing: number,
                    hindwing: number,
                    flight: number,
                    private _id: number=0) {
            this._g = field.append('g')
                .attr('class', 'bird')
                .attr('flight', flight * 8);
            this._g.append('line')
                .attr('class', 'trunk')
                .attr('x1', 5).attr('x2', 95)
                .attr('y1', 90).attr('y2', 90);
            this._g.append('line')
                .attr('class', 'beak')
                .attr('x1', 85).attr('x2', 95)
                .attr('y1', 90).attr('y2', 90);
            this._g.append('ellipse')
                .attr('class', 'wing')
                .attr('rx', 10).attr('ry', forewing * 3)
                .attr('cx', 60).attr('cy', 90 - forewing * 3);
            this._g.append('ellipse')
                .attr('class', 'wing')
                .attr('rx', 10).attr('ry', hindwing * 3)
                .attr('cx', 25).attr('cy', 90 - hindwing * 3);
            this._g.append('rect')
                .attr('width', 100)
                .attr('height', 100);
            this._g.on('click', function() {
                d3.selectAll('g.bird > rect')
                    .attr('class', null);
                d3.select(this).select('rect')
                    .attr('class', 'selected');
            });
            var x = Math.random() * parseInt(field.style('width'));
            var y = Math.random() * (parseInt(field.style('height')) - 100);
            this._g.attr('transform', 'translate('+ x +','+ y +')');
        }

        static _fly(obj) {
            var num_steps = 10;
            var step = 100;
            var t = 1000 * Math.random();
            var x = d3.transform(obj.attr('transform')).translate[0];
            var y = d3.transform(obj.attr('transform')).translate[1];
            var distance = parseFloat(obj.attr('flight'));
            for (var i=1; i<=num_steps; ++i) {
                var prop = i / num_steps;
                var dx = 0.5 * distance * (1 - Math.cos(Math.PI * prop));
                var dy = -30 * Math.sin(Math.PI * prop);
                var angle = -8 * Math.sin(2 * Math.PI * prop);
                obj.transition().ease('linear')
                    .delay(step * i + t)
                    .duration(step)
                    .attr('transform',
                          'translate('+ (x+dx) + ',' + (y+dy)  +'), rotate('+angle+',0,100)');
            }
            var field_width = parseInt(d3.select('.field').style('width'));
            if (x + distance > field_width) {
                obj.transition().delay(step * num_steps * 1.2)
                    .duration(0).ease('linear')
                    .attr('transform', 'translate('+(x - field_width - distance) +','+ y +')');
            }
            var self = this;
            obj.transition().delay(2000).each('end', function(){
                d3.select(this).call(Bird._fly);
            });
        }

        fly() {Bird._fly(this._g);}
    }

    export function Oasis(field, x, y) {
        var oasis = field.append('g');
        oasis.append('ellipse')
            .attr('class', 'oasis')
            .attr('rx', 80).attr('ry', 30)
            .attr('cx', 40).attr('cy', 15);
        oasis.attr('transform', 'translate('+ x +','+ y +')');
    }

    export function Field(parent, oasis) {
        parent.select('svg').remove();
        var field = parent.append('svg');
        field.append('rect')
            .attr('class', 'oasis-' + oasis)
            .attr('width', '100%')
            .attr('height', '100%');
        oribir.graphics.Oasis(field, 100, 100);
        oribir.graphics.Oasis(field, 300, 300);
        oribir.graphics.Oasis(field, 500, 200);
        return field;
    }
}
