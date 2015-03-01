(function(d3, x18n, t) {
    "use strict";

    function random_bernoulli(prob) {
        return Math.random() < prob;
    }

    function random_binomial(size, prob) {
        var cnt = 0;
        for (var i=0; i<size; ++i) {
            if (random_bernoulli(prob)) {++cnt;}
        }
        return cnt;
    }

    x18n.register("en", {
        params: {
            "popsize": "Population size",
            "observation": "Observation period"
        },
        axes: {
            "time": "Time (generations)",
            "distance": "Flight distance"
        },
        footer: {
            "download": "Download oribir.js",
            "report": "Report a bug",
            "develop": "Development site"
        }
    });
    x18n.register("ja", {
        params: {
            "popsize": "集団サイズ",
            "observation": "観察期間"
        },
        axes: {
            "time": "時間 (世代数)",
            "distance": "飛行距離"
        },
        footer: {
            "download": "oribir.jsをダウンロード",
            "report": "不具合報告・提案",
            "develop": "開発元"
        }
    });

    var params = [
        [t("params.popsize") + " (<var>N</var>)",
         "popsize", 100, 10000, 100, 1000],
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
        .data(params)
        .enter()
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
        right:  20,
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
            .domain([0, 1])
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
            .text(t("axes.time"))
            .attr("text-anchor", "middle");
    var y_axis_label = panel.append("text")
            .text(t("axes.distance"))
            .attr("text-anchor", 'middle');


    var canvas = d3.select("#field").append("svg")
            .attr("width", 600)
            .attr("height", 400);
    canvas.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#FF6600");

    function Bird() {
        var bird = canvas.append("g");
        bird.append("rect")
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", "none");
        bird.append("line")
            .attr("x1", 5)
            .attr("x2", 95)
            .attr("y1", 90)
            .attr("y2", 90)
            .attr("stroke-width", 10)
            .attr("stroke", "#000000");
        bird.append("line")
            .attr("x1", 85)
            .attr("x2", 95)
            .attr("y1", 90)
            .attr("y2", 90)
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
        var x = Math.random() * 600;
        var y = Math.random() * 300;
        bird.attr("transform", "translate("+ x +","+ y +")");
        return bird;
    }
    var num_steps = 10;
    function fly(obj) {
        var t = 1000 * Math.random();
        var xorig = d3.transform(obj.attr("transform")).translate[0];
        var yorig = d3.transform(obj.attr("transform")).translate[1];
        for (var i=1; i<=num_steps; ++i) {
            var prop = i / num_steps;
            var x = 50 * (1 - Math.cos(Math.PI * prop)) + xorig;
            var y = -30 * Math.sin(Math.PI * prop) + yorig;
            var angle = -8 * Math.sin(2 * Math.PI * prop);
            obj.transition()
                .delay(100 * i + t)
                .duration(100)
                .ease("linear")
                .attr("transform",
                      "translate("+ x + "," + y  +"), rotate("+angle+",0,100)");
        }
        if (x > 600) {
            obj.transition().delay(1200)
                .duration(0).ease("linear")
                .attr("transform", "translate("+(x - 800) +","+ y +")");
        }
        obj.transition().delay(2000).each("end", function(){
            d3.select(this).call(fly);
        });
    }
    for (var i=0; i<3; ++i) {
        fly(Bird());
    }

    function update_width() {
        var width = parseInt(d3.select("#graph").style("width"));
        var fixation_width = parseInt(d3.select("svg").style("padding-right"));
        svg.attr("width", width - fixation_width);
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
              ((svg_width - svg_padding.left - svg_padding.right) / 2)
                          +","+ (panel_height + 50) +")");
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
              ((svg_width - svg_padding.left - svg_padding.right) / 2)
              +","+ (panel_height + 50) +")");
        y_axis_label.attr("transform",
              "translate(-50,"+ panel_height/2 +")rotate(-90)");
    }

    function simulation() {
        var N = parseFloat(params_now["popsize"]);
        var s = parseFloat(params_now["selection"]);
        var q0 = parseFloat(params_now["frequency"]);
        var T = parseInt(params_now["observation"]);
        var rep = parseInt(params_now["replicates"]);
        scale_x.domain([0, T]);
        for (var i=0; i<rep; ++i) {
            var qt = q0;
            var trajectory = [q0];
            var repl_delay = rep * T / 5 + 600 * i / rep;
            for (var t=1; t<=T; ++t) {
                qt = random_binomial(N, (1 + s) * qt / (1 + s * qt)) / N;
                trajectory.push(qt);
            }
            results.push(trajectory);
        }
        return results;
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
        .text(t("footer.download"));
    footer.append("a")
        .attr("class", "button")
        .attr("href", "https://github.com/heavywatal/oribir.js/issues")
        .text(t("footer.report"));
    footer.append("a")
        .attr("class", "button")
        .attr("href", "https://github.com/heavywatal/oribir.js")
        .text(t("footer.develop"));

    var results = [];
    init_svg();

    d3.select(window).on("resize", update_width);
    d3.select("#start").on("click", function(){
        panel.selectAll("path").remove();
        d3.selectAll("#fixation label.value").text(0);
        results = [];
        simulation();
        animation();
    });

})(d3, x18n, t);
