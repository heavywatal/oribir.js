var random;
(function (random) {
    function randrange(start, stop) {
        if (stop === void 0) { stop = null; }
        if (stop == null) {
            return Math.floor(Math.random() * start);
        }
        else {
            return Math.floor(Math.random() * (stop - start)) + start;
        }
    }
    random.randrange = randrange;
    function randint(a, b) {
        return randrange(a, b + 1);
    }
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
    var genotype_space = [[0, 4, 8, 12], [0, 1, 2, 3]];
    function sum(lhs, rhs) {
        return lhs + rhs;
    }
    var Individual = (function () {
        function Individual(_zygote) {
            if (_zygote === void 0) { _zygote = [[8, 0, 8, 0], [8, 0, 8, 0]]; }
            this._zygote = _zygote;
            this._fitness = 0;
            this._traits = [this._zygote[0].slice(0, 1).concat(this._zygote[1].slice(0, 1)).reduce(sum) / 2, this._zygote[0].slice(2, 4).concat(this._zygote[1].slice(2, 4)).reduce(sum) / 2];
            this._traits.push(15 + this._traits[1] - this._traits[0]);
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
            return this._traits;
        };
        Individual.prototype.fight = function () {
            this._fitness = this._traits[2] / 31;
        };
        Individual.prototype.copulate = function (partner) {
            if (false) {
                return [];
            }
            var children = [];
            for (var i = 0; i < 4; ++i) {
                children.push(new Individual([this.gametogenesis(), partner.gametogenesis()]));
            }
            return children;
        };
        Individual.prototype.gametogenesis = function () {
            var gamete = [];
            for (var i = 0; i < 4; ++i) {
                gamete.push(this._zygote[random.randrange(2)][i]);
            }
            if (random.bernoulli(Individual.mutation_rate)) {
                var locus = random.randrange(gamete.length);
                gamete[locus] = random.randrange(4) * (4 - 3 * (locus % 2));
            }
            return gamete;
        };
        Individual.mutation_rate = 0.1 * 4 / 3;
        return Individual;
    })();
    simulation.Individual = Individual;
    var Population = (function () {
        function Population(_size) {
            this._size = _size;
            this._members = [];
            for (var i = 0; i < this._size; ++i) {
                this._members.push(new Individual());
            }
        }
        Population.prototype.reproduce = function () {
            var half = Math.floor(this._members.length / 2);
            var offsprings = [];
            for (var i = 0; i < half; ++i) {
                var mother = this._members[i];
                offsprings.push.apply(offsprings, mother.copulate(this._members[i + half]));
            }
            this._members = offsprings;
        };
        Population.prototype.survive = function () {
            for (var i = 0; i < this._members.length; ++i) {
                this._members[i].fight();
            }
            var survivors = [];
            for (var i = 0; i < this._size; ++i) {
                survivors.push(this._members[random.randrange(this._size)]);
            }
            this._members = survivors;
        };
        Population.prototype.print = function () {
            console.log(this._members);
        };
        Population.prototype.test = function () {
            var ind = this._members[0];
        };
        return Population;
    })();
    simulation.Population = Population;
})(simulation || (simulation = {}));
(function () {
    if (typeof window == 'undefined') {
        var pop = new simulation.Population(4);
        pop.test();
        for (var t = 0; t < 3; ++t) {
            pop.reproduce();
            pop.survive();
        }
    }
})();
