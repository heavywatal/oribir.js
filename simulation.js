var random;
(function (random) {
    function bernoulli(prob) {
        return Math.random() < prob;
    }
    random.bernoulli = bernoulli;
    function binomial(size, prob) {
        var cnt = 0;
        for (var i = 0; i < size; ++i) {
            if (bernoulli(prob)) {
                ++cnt;
            }
        }
        return cnt;
    }
    random.binomial = binomial;
})(random || (random = {}));
var simulation;
(function (simulation) {
    var Individual = (function () {
        function Individual(_zygote, _fitness) {
            if (_zygote === void 0) { _zygote = ['ATGC', 'ATGC']; }
            if (_fitness === void 0) { _fitness = 0; }
            this._zygote = _zygote;
            this._fitness = _fitness;
            console.log('constructor');
            this._traits = [15, 15];
            this._flight = 15 + this._traits[1] - this._traits[0];
            this.print();
        }
        Individual.prototype.print = function () {
            console.log(this._zygote);
            console.log(this.phenotype());
            console.log(this.fitness());
        };
        Individual.prototype.fitness = function () {
            return this._fitness;
        };
        Individual.prototype.phenotype = function () {
            return this._traits.concat(this._flight);
        };
        Individual.prototype.flight = function () {
            this._fitness = this._flight / 31;
        };
        Individual.prototype.gametogenesis = function () {
            return '';
        };
        return Individual;
    })();
    simulation.Individual = Individual;
    var Population = (function () {
        function Population(size) {
            this.size = size;
            this.members = [];
            for (var i = 0; i < size; ++i) {
                this.members.push(new Individual());
            }
        }
        Population.prototype.print = function () {
            console.log(this.members);
        };
        return Population;
    })();
    simulation.Population = Population;
})(simulation || (simulation = {}));
