var oribir;
(function (oribir) {
    var util;
    (function (util) {
        function range(start, stop) {
            if (stop === void 0) { stop = null; }
            var result = [];
            if (stop == null) {
                stop = start;
                start = 0;
            }
            for (; start < stop; ++start) {
                result.push(start);
            }
            return result;
        }
        util.range = range;
        function partial_sums(array) {
            var s = 0;
            var result = [];
            for (var i = 0; i < array.length; ++i) {
                s += array[i];
                result.push(s);
            }
            return result;
        }
        util.partial_sums = partial_sums;
    })(util = oribir.util || (oribir.util = {}));
})(oribir || (oribir = {}));
var oribir;
(function (oribir) {
    var random;
    (function (random) {
        function uniform(min, max) {
            return min + (max - min) * Math.random();
        }
        random.uniform = uniform;
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
        function sample(array, k) {
            var n = array.length;
            var result = [];
            for (var i = 0; i < k; ++i) {
                var j = randrange(n - i);
                result.push(array[j]);
                array[j] = array[n - i - 1];
            }
            return result;
        }
        random.sample = sample;
    })(random = oribir.random || (oribir.random = {}));
})(oribir || (oribir = {}));
var oribir;
(function (oribir) {
    var genotype_space = [[0, 4, 8, 12], [0, 1, 2, 3]];
    var initial_gamete = [2, 1, 2, 1, 2, 1, 2, 1];
    function sum(lhs, rhs) {
        return lhs + rhs;
    }
    var Individual = (function () {
        function Individual(_zygote) {
            if (_zygote === void 0) { _zygote = [initial_gamete, initial_gamete]; }
            this._zygote = _zygote;
            this._traits = [this._zygote[0].slice(0, 4).concat(this._zygote[1].slice(0, 4)).reduce(sum) / 2, this._zygote[0].slice(4, 8).concat(this._zygote[1].slice(4, 8)).reduce(sum) / 2];
            this._traits.push(Individual.MAX_FLIGHT / 2 + this._traits[1] - this._traits[0]);
        }
        Object.defineProperty(Individual, "MUTATION_RATE", {
            set: function (mu) {
                this._MUTATION_RATE = mu * 4 / 3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual, "MAX_WING", {
            get: function () {
                return 12;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual, "MAX_FLIGHT", {
            get: function () {
                return 24;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual.prototype, "flight", {
            get: function () {
                return this._traits[2];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual.prototype, "phenotype", {
            get: function () {
                return this._traits;
            },
            enumerable: true,
            configurable: true
        });
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
            for (var i = 0; i < initial_gamete.length; ++i) {
                if (oribir.random.bernoulli(Individual._MUTATION_RATE)) {
                    gamete.push(oribir.random.randrange(4));
                }
                else {
                    gamete.push(this._zygote[oribir.random.randrange(2)][i]);
                }
            }
            return gamete;
        };
        Individual._MUTATION_RATE = 0.1 * 4 / 3;
        return Individual;
    })();
    oribir.Individual = Individual;
    var Population = (function () {
        function Population(_size, environment) {
            if (environment === void 0) { environment = '1'; }
            this._size = _size;
            this._members = [];
            for (var i = 0; i < this._size; ++i) {
                this._members.push(new Individual());
            }
            var sigma = 0.5;
            var coef = -0.5 / Math.pow(sigma, 2);
            this._landscape = function (flight) {
                var base = flight / Individual.MAX_FLIGHT - Population._OPTIMA[environment];
                return Math.exp(coef * Math.pow(base, 2));
            };
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
            var fitness_values = [];
            for (var i = 0; i < this._members.length; ++i) {
                fitness_values.push(this._landscape(this._members[i].flight));
            }
            var indices = roulette(fitness_values, this._size);
            var survivors = [];
            for (var i = 0; i < indices.length; ++i) {
                survivors.push(this._members[indices[i]]);
            }
            this._members = survivors;
        };
        Population.prototype.snapshot = function () {
            var n = this._members.length;
            var output = [[], [], []];
            for (var i = 0; i < n; ++i) {
                var p = this._members[i].phenotype;
                for (var j = 0; j < 3; ++j) {
                    output[j].push(p[j]);
                }
            }
            return output;
        };
        Object.defineProperty(Population.prototype, "size", {
            get: function () {
                return this._members.length;
            },
            enumerable: true,
            configurable: true
        });
        Population.prototype.print = function () {
            console.log(this._members);
        };
        Population.prototype.test = function () {
            var ind = this._members[0];
        };
        Population._OPTIMA = {
            '0': 0.97,
            '1': 0.50,
            '2': 0.03,
        };
        return Population;
    })();
    oribir.Population = Population;
    function roulette(fitness, n) {
        if (n === void 0) { n = null; }
        if (n === null) {
            n = fitness.length;
        }
        var bounds = oribir.util.partial_sums(fitness);
        var total_fitness = bounds[bounds.length - 1];
        var indices = [];
        for (var i = 0; i < n; ++i) {
            var dart = oribir.random.uniform(0, total_fitness);
            for (var j = 0; j < bounds.length; ++j) {
                if (dart < bounds[j]) {
                    indices.push(j);
                    break;
                }
            }
        }
        //        console.log(fitness);
        //        console.log(indices);
        return indices;
    }
    oribir.roulette = roulette;
})(oribir || (oribir = {}));
(function () {
    if (typeof window == 'undefined') {
        var die = oribir.util.range(1, 7);
        console.log(oribir.random.sample(die, 3));
        console.log(oribir.util.partial_sums(die));
        console.log(oribir.roulette(die, 10));
        var pop = new oribir.Population(4, '2');
        pop.test();
        for (var t = 0; t < 4; ++t) {
            pop.reproduce();
            pop.survive();
            console.log(pop.snapshot());
        }
    }
})();
