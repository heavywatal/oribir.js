/// <reference path='typings/d3/d3.d.ts' />
/// <reference path='typings/i18next/i18next.d.ts' />
/// <reference path='simulation.ts' />
/// <reference path='graphics.ts' />
/// <reference path='plot.ts' />
'use strict';

function param_value(id: string): string {
    return <any> d3.select('#'+ id +' input').property('value');
}

class EvolutionTab {
    private static _NUM_INSTANCES: number = 0;
    private _population: oribir.Population;
    private _field;
    private _plot_forewing;
    private _plot_hindwing;
    private _plot_flight;

    constructor(parent, t) {
        var num = ++EvolutionTab._NUM_INSTANCES;
        var li = parent.append('li').attr('id', 'tab' + num);
        li.append('input')
            .attr('id', 'radio' + num)
            .attr('name', 'tab')
            .attr('type', 'radio');
        li.append('label')
            .attr('for', 'radio' + num)
            .text(t('population') + ' ' + num);
        li.append('div')
            .attr('class', 'tab-content');

        var self = this;
        var radio = li.select('input');
        radio.property('checked', true);  // to calc width
        var tab_content = li.select('.tab-content');
        tab_content.append('button')
          .attr('type', 'button')
          .attr('class', 'controller start')
          .attr('disabled', true)
          .text('START!')
          .on('click', function(){self.run()});
        var div_field = tab_content.append('div')
          .attr('class', 'field');
        this._field = oribir.graphics.Field(div_field);

        var T = parseInt(param_value('observation'));
        var parent = tab_content.append('div')
            .attr('class', 'graph');
        this._plot_forewing = new oribir.plot.Plot(parent,
            'forewing', T, oribir.Individual.MAX_WING,
            t('axes.time'), t('axes.forewing'));
        this._plot_hindwing = new oribir.plot.Plot(parent,
            'hindwing', T, oribir.Individual.MAX_WING,
            t('axes.time'), t('axes.hindwing'));
        this._plot_flight = new oribir.plot.Plot(parent,
            'flight', T, oribir.Individual.MAX_FLIGHT,
            t('axes.time'), t('axes.distance'));
        d3.select(window).on('resize', function() {self.update_width();});
        radio.property('checked', false);
    }

    public get_ready() {
        var N = parseInt(param_value('popsize'));
        var env = param_value('oasis');
        this._population = new oribir.Population(N, env);
        this.display_population();
    }

    public erase_plot(): void {
        this._plot_forewing.path_d([]);
        this._plot_hindwing.path_d([]);
        this._plot_flight.path_d([]);
    }

    private display_population(): number[][] {
        var snapshot = this._population.snapshot();
        this._field.selectAll('g.bird').transition().delay(0).remove();
        this._field.selectAll('g.bird').remove();
        var n_samples = 3;
        var range = oribir.util.range(snapshot[0].length);
        var indices = oribir.random.sample(range, n_samples);
        for (var i=0; i<n_samples; ++i) {
            var idx = indices[i];
            var bird = new oribir.graphics.Bird(this._field,
                                                snapshot[0][idx],
                                                snapshot[1][idx],
                                                snapshot[2][idx],
                                                idx);
            bird.fly();
        }
        return snapshot;
    }

    private run(): void {
        var T = parseInt(param_value('observation'));
        this._plot_forewing.domain([0, T]);
        this._plot_hindwing.domain([0, T]);
        this._plot_flight.domain([0, T]);
        this._plot_forewing.path_d([]);
        this._plot_hindwing.path_d([]);
        this._plot_flight.path_d([]);

        var mean_history = [[], [], []];
        var sd_history = [[], [], []];
        for (var t=0; t<=T; ++t) {
            var phenotypes = this.display_population();
            for (var i=0; i<3; ++i) {
                mean_history[i].push(d3.mean(phenotypes[i]));
                //sd_history[i].push(Math.sqrt(d3.variance(phenotypes[i])));
            }
            this._plot_forewing.path_d(mean_history[0], 10 * t);
            this._plot_hindwing.path_d(mean_history[1], 10 * t);
            this._plot_flight.path_d(mean_history[2], 10 * t);
            this._population.reproduce();
            this._population.survive();
        }
    }

    private update_width(): void {
        this._plot_forewing.update_width();
        this._plot_hindwing.update_width();
        this._plot_flight.update_width();
    }
}

class BreedingTab {
    private static _NUM_INSTANCES: number = 0;
    private _population: oribir.Population;
    private _field;
    private _plot_forewing;
    private _plot_hindwing;
    private _plot_flight;

    constructor(parent, t) {
        var num = 3;
        var li = parent.append('li').attr('id', 'tab' + num);
        li.append('input')
            .attr('id', 'radio' + num)
            .attr('name', 'tab')
            .attr('type', 'radio');
        li.append('label')
            .attr('for', 'radio' + num)
            .text(t('breeding experiment'));
        li.append('div')
            .attr('class', 'tab-content')
            .text('UNDER CONSTRUCTION');
    }
}


i18n.init({
  resGetPath: 'locales/__ns__.__lng__.json',
  shortcutFunction: 'defaultValue'
}, function(t) {

    var params = [
        [t('params.popsize') + ' (<var>N</var>)',
         'popsize', 100, 1000, 100, 100],
        [t('params.mu') + ' (<var>μ</var>)',
         'mu', 1e-3, 1e-1, 1e-3, 1e-2],
        [t('params.observation'),
         'observation', 50, 400, 50, 100],
        [t('params.oasis'),
         'oasis', 0, 2, 1, 0]
    ];

    var input_items = d3.select('form')
        .selectAll('dl')
        .data(params).enter()
        .append('dl')
        .attr('id', function(d){return d[1];})
        .attr('class', 'parameter');

    input_items.append('label')
        .attr('class', 'value')
        .attr('for', function(d){return d[1];})
        .text(function(d){return d[5];});

    input_items.append('dt').append('label')
        .attr('class', 'name')
        .attr('for', function(d){return d[1];})
        .html(function(d){return d[0];});

    var input_ranges = input_items.append('dd')
        .attr('class', 'param_range');
    input_ranges.append('input')
        .attr('type', 'range')
        .attr('name', function(d){return d[1];})
        .attr('min', function(d){return d[2];})
        .attr('max', function(d){return d[3];})
        .attr('step', function(d){return d[4];})
        .attr('value', function(d){return d[5];})
        .on('input', function(d){
            input_items
                .select('#'+ d[1] +' label.value')
                .text(this.value);
        });
    input_ranges.append('label')
        .attr('class', 'min')
        .attr('for', function(d){return d[1];})
        .text(function(d){return d[2];});
    input_ranges.append('label')
        .attr('class', 'max')
        .attr('for', function(d){return d[1];})
        .text(function(d){return d[3];});

    var lock_button = d3.select('form').append('button')
        .attr('type', 'button')
        .attr('class', 'controller lock')
        .text('Lock Parameters');

    var tabs = d3.select('#tabs');
    var tab1 = new EvolutionTab(tabs, t);
    var tab2 = new EvolutionTab(tabs, t);
    var tab3 = new BreedingTab(tabs, t);
    d3.select('#radio1').property('checked', true);

    function toggle_form() {
        var is_unlocked = d3.select('button.start').attr('disabled');
        if (is_unlocked) {  // lock
            d3.selectAll('.param_range input').attr('disabled', true);
            d3.selectAll('button.start').attr('disabled', null);
            lock_button.text('Reset');
            oribir.Individual.MUTATION_RATE = parseFloat(param_value('mu'));
            tab1.get_ready();
            tab2.get_ready();
        } else {  // reset
            d3.selectAll('.param_range input').attr('disabled', null);
            d3.selectAll('button.start').attr('disabled', true);
            lock_button.text('Lock');
            tab1.erase_plot();
            tab2.erase_plot();
            d3.selectAll('g.bird').remove();
        }
    }
    lock_button.on('click', toggle_form);

    var footer = d3.select('#footer');
    footer.append('a')
        .attr('class', 'button')
        .attr('href', 'https://github.com/heavywatal/oribir.js/releases/latest')
        .text(t('footer.download'));
    footer.append('a')
        .attr('class', 'button')
        .attr('href', 'https://github.com/heavywatal/oribir.js/issues')
        .text(t('footer.report'));
    footer.append('a')
        .attr('class', 'button')
        .attr('href', 'https://github.com/heavywatal/oribir.js')
        .text(t('footer.develop'));
});
