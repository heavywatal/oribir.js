/// <reference path="typings/d3/d3.d.ts" />
"use strict";

module oribir.graphics {

    export function Bird(field) {
        var bird = field.append("g");
        bird.append("rect")
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", "none");
        bird.append("line")
            .attr("x1", 5).attr("x2", 95)
            .attr("y1", 90).attr("y2", 90)
            .attr("stroke-width", 10)
            .attr("stroke", "#000000");
        bird.append("line")
            .attr("x1", 85).attr("x2", 95)
            .attr("y1", 90).attr("y2", 90)
            .attr("stroke-width", 10)
            .attr("stroke", "#FFFF00");
        bird.append("ellipse")
            .attr("rx", 10).attr("ry", 20)
            .attr("cx", 60).attr("cy", 70)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 10);
        bird.append("ellipse")
            .attr("rx", 10).attr("ry", 20)
            .attr("cx", 25).attr("cy", 70)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 10);
        var x = Math.random() * parseInt(field.style("width"));
        var y = Math.random() * parseInt(field.style("height"));
        bird.attr("transform", "translate("+ x +","+ y +")");
        return bird;
    }

    var num_steps = 10;
    var step = 100;

    export function fly(obj) {
        var t = 1000 * Math.random();
        var x = d3.transform(obj.attr("transform")).translate[0];
        var y = d3.transform(obj.attr("transform")).translate[1];
        var distance = 100;
        for (var i=1; i<=num_steps; ++i) {
            var prop = i / num_steps;
            var dx = 0.5 * distance * (1 - Math.cos(Math.PI * prop));
            var dy = -30 * Math.sin(Math.PI * prop);
            var angle = -8 * Math.sin(2 * Math.PI * prop);
            obj.transition().ease("linear")
                .delay(step * i + t)
                .duration(step)
                .attr("transform",
                      "translate("+ (x+dx) + "," + (y+dy)  +"), rotate("+angle+",0,100)");
        }
        var field_width = parseInt(d3.select('#field').style("width"));
        if (x + distance > field_width) {
            obj.transition().delay(step * num_steps * 1.2)
                .duration(0).ease("linear")
                .attr("transform", "translate("+(x - field_width - distance) +","+ y +")");
        }
        obj.transition().delay(2000).each("end", function(){
            d3.select(this).call(fly);
        });
    }

    export function Oasis(field, x, y) {
        var oasis = field.append("g");
        oasis.append("ellipse")
            .attr("rx", 80).attr("ry", 30)
            .attr("cx", 40).attr("cy", 15)
            .attr("fill", "#0066FF")
            .attr("stroke", "#99CCFF")
            .attr("stroke-width", "6");
        oasis.attr("transform", "translate("+ x +","+ y +")");
    }
}
