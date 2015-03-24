/// <reference path='typings/d3/d3.d.ts' />
/// <reference path='typings/i18next/i18next.d.ts' />
/// <reference path='simulation.ts' />
/// <reference path='graphics.ts' />
/// <reference path='plot.ts' />
'use strict';
i18n.init({
    resGetPath: 'locales/__ns__.__lng__.json',
    shortcutFunction: 'defaultValue'
}, function (t) {
    var params = [
        [t('params.oasis'), 'oasis', 1, 3, 1, 2],
        [t('params.mu') + ' (<var>μ</var>)', 'mu', 1e-3, 1e-1, 1e-3, 1e-2],
        [t('params.popsize') + ' (<var>N</var>)', 'popsize', 100, 1000, 100, 100],
        [t('params.observation'), 'observation', 50, 400, 50, 100]
    ];
    var params_now = {};
    for (var i = 0; i < params.length; ++i) {
        var x = params[i];
        params_now[String(x[1])] = x[5];
    }
    var input_items = d3.select('form').selectAll('dl').data(params).enter().append('dl').attr('id', function (d) {
        return d[1];
    }).attr('class', 'parameter');
    input_items.append('label').attr('class', 'value').attr('for', function (d) {
        return d[1];
    }).text(function (d) {
        return d[5];
    });
    input_items.append('dt').append('label').attr('class', 'name').attr('for', function (d) {
        return d[1];
    }).html(function (d) {
        return d[0];
    });
    var input_ranges = input_items.append('dd').attr('class', 'param_range');
    input_ranges.append('input').attr('type', 'range').attr('name', function (d) {
        return d[1];
    }).attr('min', function (d) {
        return d[2];
    }).attr('max', function (d) {
        return d[3];
    }).attr('step', function (d) {
        return d[4];
    }).attr('value', function (d) {
        return d[5];
    }).on('input', function (d) {
        update_param(d[1], this.value);
    });
    input_ranges.append('label').attr('class', 'min').attr('for', function (d) {
        return d[1];
    }).text(function (d) {
        return d[2];
    });
    input_ranges.append('label').attr('class', 'max').attr('for', function (d) {
        return d[1];
    }).text(function (d) {
        return d[3];
    });
    function update_param(id, value) {
        input_items.select('#' + id + ' label.value').text(value);
        params_now[id] = value;
    }
    var button_box = d3.select('form').append('div').attr('id', 'button_box');
    var lock_button = button_box.append('button').attr('type', 'button').attr('id', 'lock').attr('class', 'controller').text('Lock Parameters');
    var start_button = button_box.append('button').attr('type', 'button').attr('id', 'start').attr('class', 'controller').attr('disabled', true).text('START!');
    function toggle_form() {
        var is_unlocked = start_button.attr('disabled');
        if (is_unlocked) {
            d3.selectAll('.param_range input').attr('disabled', true);
            start_button.attr('disabled', null);
            lock_button.text('Reset');
            var N = parseInt(params_now['popsize']);
            population = new oribir.simulation.Population(N);
            display_population(population.snapshot());
        }
        else {
            d3.selectAll('.param_range input').attr('disabled', null);
            start_button.attr('disabled', true);
            lock_button.text('Lock');
            plot_forewing.path_d([]);
            plot_hindwing.path_d([]);
            plot_flight.path_d([]);
            d3.selectAll('g.bird').remove();
        }
    }
    lock_button.on('click', toggle_form);
    var field = oribir.graphics.Field();
    function display_population(snapshot) {
        d3.selectAll('g.bird').remove();
        var n_samples = 3;
        var range = oribir.util.range(population.size);
        var indices = oribir.random.sample(range, n_samples);
        for (var i = 0; i < n_samples; ++i) {
            var idx = indices[i];
            var bird = new oribir.graphics.Bird(field, snapshot[0][idx], snapshot[1][idx], snapshot[2][idx], idx);
            bird.fly();
        }
    }
    var plot_forewing = new oribir.plot.Plot('forewing', params_now['observation'], 15, i18n.t('axes.time'), i18n.t('axes.forewing'));
    var plot_hindwing = new oribir.plot.Plot('hindwing', params_now['observation'], 15, i18n.t('axes.time'), i18n.t('axes.hindwing'));
    var plot_flight = new oribir.plot.Plot('flight', params_now['observation'], 31, i18n.t('axes.time'), i18n.t('axes.distance'));
    var population;
    function run() {
        var T = parseInt(params_now['observation']);
        plot_forewing.domain([0, T]);
        plot_hindwing.domain([0, T]);
        plot_flight.domain([0, T]);
        plot_forewing.path_d([]);
        plot_hindwing.path_d([]);
        plot_flight.path_d([]);
        var mean_history = [[], [], []];
        var sd_history = [[], [], []];
        for (var t = 0; t <= T; ++t) {
            var phenotypes = population.snapshot();
            display_population(phenotypes);
            for (var i = 0; i < 3; ++i) {
                mean_history[i].push(d3.mean(phenotypes[i]));
            }
            plot_forewing.path_d(mean_history[0], 10 * t);
            plot_hindwing.path_d(mean_history[1], 10 * t);
            plot_flight.path_d(mean_history[2], 10 * t);
            population.reproduce();
            population.survive();
        }
    }
    start_button.on('click', run);
    function update_width() {
        plot_forewing.update_width();
        plot_hindwing.update_width();
        plot_flight.update_width();
    }
    d3.select(window).on('resize', update_width);
    var footer = d3.select('#footer');
    footer.append('a').attr('class', 'button').attr('href', 'https://github.com/heavywatal/oribir.js/releases/latest').text(i18n.t('footer.download'));
    footer.append('a').attr('class', 'button').attr('href', 'https://github.com/heavywatal/oribir.js/issues').text(i18n.t('footer.report'));
    footer.append('a').attr('class', 'button').attr('href', 'https://github.com/heavywatal/oribir.js').text(i18n.t('footer.develop'));
});
