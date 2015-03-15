/// <reference path="typings/d3/d3.d.ts" />
/// <reference path="typings/i18next/i18next.d.ts" />
/// <reference path="simulation.ts" />
/// <reference path="graphics.ts" />
"use strict";

i18n.init({
  resGetPath: 'locales/__ns__.__lng__.json',
  shortcutFunction: 'defaultValue'
}, function(t) {

    var pop = new simulation.Population(3);
    pop.print();

    var params = [
        [t("params.oasis"),
         "oasis", 1, 3, 1, 2],
        [t("params.mu") + " (<var>μ</var>)",
         "mu", 1e-3, 1e-1, 1e-3, 1e-2],
        [t("params.popsize") + " (<var>N</var>)",
         "popsize", 100, 1000, 100, 100],
        [t("params.observation"),
         "observation", 50, 400, 50, 100]
    ];

    var params_now = {};
    for (var i=0; i<params.length; ++i) {
        var x = params[i];
        params_now[String(x[1])] = x[5];
    }

    var input_items = d3.select("form")
        .selectAll("dl")
        .data(params).enter()
        .append("dl")
        .attr("id", function(d){return d[1];})
        .attr("class", "parameter");

    input_items.append("label")
        .attr("class", "value")
        .attr("for", function(d){return d[1];})
        .text(function(d){return d[5];});

    input_items.append("dt")
        .append("label")
        .attr("class", "name")
        .attr("for", function(d){return d[1];})
        .html(function(d){return d[0];});

    var input_ranges = input_items.append("dd")
        .attr("class", "param_range");
    input_ranges.append("input")
        .attr("type", "range")
        .attr("name", function(d){return d[1];})
        .attr("min", function(d){return d[2];})
        .attr("max", function(d){return d[3];})
        .attr("step", function(d){return d[4];})
        .attr("value", function(d){return d[5];})
        .on("input", function(d){update_param(d[1], this.value);});
    input_ranges.append("label")
        .attr("class", "min")
        .attr("for", function(d){return d[1];})
        .text(function(d){return d[2];});
    input_ranges.append("label")
        .attr("class", "max")
        .attr("for", function(d){return d[1];})
        .text(function(d){return d[3];});

    function update_param(id, value) {
        input_items
            .select("#"+id+" label.value")
            .text(value);
        params_now[id] = value;
    }

    d3.select("form").append("button")
        .attr("type", "button")
        .attr("id", "start")
        .attr("class", "button")
        .text("START!");

    var svg_padding = {
        top:    20,
        right:  30,
        bottom: 60,
        left:   80
    };

    var svg = d3.select("#graph").append("svg");

    var panel = svg.append("g")
            .attr("class", "panel")
            .attr("transform",
                  "translate("+svg_padding.left+","+svg_padding.top+")")
            .attr("height",
                  parseInt(svg.style("height")) - svg_padding.top - svg_padding.bottom);
    var panel_bg = panel.append("rect")
            .attr("class", "panel_background")
            .attr("height", panel.attr("height"));

    var scale_x = d3.scale.linear()
            .domain([0, 100]);
    var scale_y = d3.scale.linear()
            .domain([0, 15])
            .range([panel.attr("height"), 0]);
    var line = d3.svg.line()
            .x(function(d, i) {return scale_x(i);})
            .y(function(d, i) {return scale_y(d);})
            .interpolate("linear");
    var x_axis = d3.svg.axis()
            .scale(scale_x)
            .orient("bottom");
    var y_axis = d3.svg.axis()
            .scale(scale_y)
            .orient("left");
    var x_axis_label = panel.append("text")
            .text(i18n.t("axes.time"))
            .attr("text-anchor", "middle");
    var y_axis_label = panel.append("text")
            .text(i18n.t("axes.distance"))
            .attr("text-anchor", 'middle');

    var field = d3.select("#field").append("svg")
            .attr("width", "100%")
            .attr("height", 400);
    field.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#FF6600");

    oribir.graphics.Oasis(field, 100, 100);
    oribir.graphics.Oasis(field, 300, 300);
    oribir.graphics.Oasis(field, 500, 200);

    for (var i=0; i<3; ++i) {
        var bird = oribir.graphics.Bird(field);
        oribir.graphics.fly(bird);
    }

    function update_width() {
        var width = parseInt(d3.select("#graph").style("width"));
        svg.attr("width", width);
        var svg_width = parseInt(svg.attr("width"));
        var panel_width = svg_width - svg_padding.left - svg_padding.right;
        var panel_height = parseInt(panel.attr("height"));
        panel_bg.attr("width", panel_width);
        scale_x.range([0, panel_width]);
        d3.select("#xaxis")
            .attr("transform",
                  "translate(0," + panel_height + ")")
            .call(x_axis);
        x_axis_label.attr("transform", "translate("+
              ((svg_width - svg_padding.left - svg_padding.right) / 2)+","+
              (panel_height + 50) +")");
        panel.selectAll("path").remove();
        plot();
    }

    function init_svg() {
        update_width();
        var svg_width = parseInt(svg.attr("width"));
        var panel_width = svg_width - svg_padding.left - svg_padding.right;
        var panel_height = parseInt(panel.attr("height"));

        panel.append("g")
            .attr("id", "xaxis")
            .attr("transform",
                  "translate(0," + panel.attr("height") + ")")
            .call(x_axis);
        panel.append("g")
            .attr("id", "yaxis")
            .call(y_axis);

        x_axis_label.attr("transform", "translate("+
              ((svg_width - svg_padding.left - svg_padding.right) / 2)+
              ","+ (panel_height + 50) +")");
        y_axis_label.attr("transform",
              "translate(-50,"+ panel_height/2 +")rotate(-90)");
    }

    function run(params_now) {
        var N = parseFloat(params_now.popsize);
        var T = parseInt(params_now.observation);
        scale_x.domain([0, T]);
        var pop = new simulation.Population(N);
        var mean_history = [[], [], []];
        var sd_history = [[], [], []];
        for (var t=1; t<=T; ++t) {
            pop.reproduce();
            pop.survive();
            var phenotypes = pop.snapshot();
            for (var i=0; i<3; ++i) {
                mean_history[i].push(d3.mean(phenotypes[i]));
                //sd_history[i].push(Math.sqrt(d3.variance(phenotypes[i])));
            }
        }
        results.push(mean_history[0]);
    }

    function plot() {
        var rep = results.length;
        for (var i=0; i<rep; ++i) {
            var trajectory = results[i];
            panel.append("path").attr("d", line(trajectory));
        }
    }

    function animation() {
        var rep = results.length;
        for (var i=0; i<rep; ++i) {
            var trajectory = results[i];
            var T = trajectory.length;
            var repl_delay = rep * T / 5 + 600 * i / rep;
            var path = panel.append("path");
            for (var t=0; t<=T; ++t) {
                var part = trajectory.slice(0, t);
                path.transition().delay(repl_delay + 23 * t).ease("linear")
                    .attr("d", line(part));
            }
        }
    }

    var footer = d3.select("#footer");
    footer.append("a")
        .attr("class", "button")
        .attr("href", "https://github.com/heavywatal/oribir.js/releases/latest")
        .text(i18n.t("footer.download"));
    footer.append("a")
        .attr("class", "button")
        .attr("href", "https://github.com/heavywatal/oribir.js/issues")
        .text(i18n.t("footer.report"));
    footer.append("a")
        .attr("class", "button")
        .attr("href", "https://github.com/heavywatal/oribir.js")
        .text(i18n.t("footer.develop"));

    var results = [];
    init_svg();

    d3.select(window).on("resize", update_width);
    d3.select("#start").on("click", function(){
        panel.selectAll("path").remove();
        results = [];
        run(params_now);
        animation();
    });
});
