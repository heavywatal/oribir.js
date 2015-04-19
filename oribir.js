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
        [t('params.popsize') + ' (<var>N</var>)', 'popsize', 100, 1000, 100, 100],
        [t('params.mu') + ' (<var>μ</var>)', 'mu', 1e-3, 1e-1, 1e-3, 1e-2],
        [t('params.observation'), 'observation', 50, 400, 50, 100],
        [t('params.oasis'), 'oasis', 0, 2, 1, 0]
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
    var lock_button = d3.select('form').append('button').attr('type', 'button').attr('class', 'controller lock').text('Lock Parameters');
    var population;
    function toggle_form() {
        var is_unlocked = start_button.attr('disabled');
        if (is_unlocked) {
            d3.selectAll('.param_range input').attr('disabled', true);
            start_button.attr('disabled', null);
            lock_button.text('Reset');
            oribir.Individual.MUTATION_RATE = params_now['mu'];
            var N = parseInt(params_now['popsize']);
            population = new oribir.Population(N, params_now['oasis']);
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
    var tabs = d3.select('#tabs');
    var li1 = tabs.append('li');
    li1.append('input').attr('id', 'tab1').attr('name', 'tab').attr('type', 'radio').property('checked', true);
    li1.append('label').attr('for', 'tab1').text('Population 1');
    li1.append('div').attr('class', 'tab-content').attr('id', 'pop1');
    var li2 = tabs.append('li');
    li2.append('input').attr('id', 'tab2').attr('name', 'tab').attr('type', 'radio');
    li2.append('label').attr('for', 'tab2').text('Population 2');
    li2.append('div').attr('class', 'tab-content').attr('id', 'pop2');
    var li3 = tabs.append('li');
    li3.append('input').attr('id', 'tab3').attr('name', 'tab').attr('type', 'radio');
    li3.append('label').attr('for', 'tab3').text('Breeding Experiment');
    li3.append('div').attr('class', 'tab-content').attr('id', 'breeding');
    var tab_content = d3.select('#pop1');
    var start_button = tab_content.append('button').attr('type', 'button').attr('class', 'controller start').attr('disabled', true).text('START!');
    var div_field = tab_content.append('div').attr('class', 'field');
    var field = oribir.graphics.Field(div_field);
    function display_population(snapshot) {
        d3.selectAll('g.bird').transition().delay(0).remove();
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
    var parent = tab_content.append('div').attr('class', 'graph');
    var plot_forewing = new oribir.plot.Plot(parent, 'forewing', params_now['observation'], oribir.Individual.MAX_WING, i18n.t('axes.time'), i18n.t('axes.forewing'));
    var plot_hindwing = new oribir.plot.Plot(parent, 'hindwing', params_now['observation'], oribir.Individual.MAX_WING, i18n.t('axes.time'), i18n.t('axes.hindwing'));
    var plot_flight = new oribir.plot.Plot(parent, 'flight', params_now['observation'], oribir.Individual.MAX_FLIGHT, i18n.t('axes.time'), i18n.t('axes.distance'));
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
