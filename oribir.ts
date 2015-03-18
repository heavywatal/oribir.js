/// <reference path="typings/d3/d3.d.ts" />
/// <reference path="typings/i18next/i18next.d.ts" />
/// <reference path="simulation.ts" />
/// <reference path="graphics.ts" />
/// <reference path="plot.ts" />
"use strict";

i18n.init({
  resGetPath: 'locales/__ns__.__lng__.json',
  shortcutFunction: 'defaultValue'
}, function(t) {

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

    input_items.append("dt").append("label")
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

    var field = oribir.graphics.Field();
    for (var i=0; i<3; ++i) {
        var bird = oribir.graphics.Bird(field);
        oribir.graphics.fly(bird);
    }

    var plot_forewing = new oribir.plot.Plot(
        "forewing", params_now["observation"], 15,
        i18n.t("axes.time"), i18n.t("axes.forewing"));
    var plot_hindwing = new oribir.plot.Plot(
        "hindwing", params_now["observation"], 15,
        i18n.t("axes.time"), i18n.t("axes.hindwing"));
    var plot_flight = new oribir.plot.Plot(
        "flight", params_now["observation"], 31,
        i18n.t("axes.time"), i18n.t("axes.distance"));

    function run() {
        var N = parseFloat(params_now["popsize"]);
        var T = parseInt(params_now["observation"]);
        plot_forewing.domain([0, T]);
        plot_hindwing.domain([0, T]);
        plot_flight.domain([0, T]);
        plot_forewing.path_d([]);
        plot_hindwing.path_d([]);
        plot_flight.path_d([]);

        var pop = new simulation.Population(N);
        var mean_history = [[], [], []];
        var sd_history = [[], [], []];
        for (var t=0; t<=T; ++t) {
            var phenotypes = pop.snapshot();
            for (var i=0; i<3; ++i) {
                mean_history[i].push(d3.mean(phenotypes[i]));
                //sd_history[i].push(Math.sqrt(d3.variance(phenotypes[i])));
            }
            plot_forewing.path_d(mean_history[0], 10 * t);
            plot_hindwing.path_d(mean_history[1], 10 * t);
            plot_flight.path_d(mean_history[2], 10 * t);
            pop.reproduce();
            pop.survive();
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

    function update_width() {
        plot_forewing.update_width();
        plot_hindwing.update_width();
        plot_flight.update_width();
    }
    d3.select(window).on("resize", update_width);
    d3.select("#start").on("click", run);
});
