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
                this._traits = [this._zygote[0].slice(0, 1).concat(this._zygote[1].slice(0, 1)).reduce(sum) / 2, this._zygote[0].slice(2, 4).concat(this._zygote[1].slice(2, 4)).reduce(sum) / 2];
                this._traits.push(15 + this._traits[1] - this._traits[0]);
            }
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
                for (var i = 0; i < 4; ++i) {
                    gamete.push(this._zygote[oribir.random.randrange(2)][i]);
                }
                if (oribir.random.bernoulli(Individual.mutation_rate)) {
                    var locus = oribir.random.randrange(gamete.length);
                    gamete[locus] = oribir.random.randrange(4) * (4 - 3 * (locus % 2));
                }
                return gamete;
            };
            Individual.mutation_rate = 0.1 * 4 / 3;
            return Individual;
        })();
        simulation.Individual = Individual;
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
                    var base = flight / 31.0 - Population._OPTIMA[environment];
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
                '0': 0.03,
                '1': 0.50,
                '2': 0.97,
            };
            return Population;
        })();
        simulation.Population = Population;
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
        simulation.roulette = roulette;
    })(simulation = oribir.simulation || (oribir.simulation = {}));
})(oribir || (oribir = {}));
(function () {
    if (typeof window == 'undefined') {
        console.log(oribir.random.sample(die, 3));
        console.log(oribir.util.partial_sums(die));
        console.log(oribir.simulation.roulette(die, 10));
        var pop = new oribir.simulation.Population(4, '2');
        pop.test();
        for (var t = 0; t < 4; ++t) {
            pop.reproduce();
            pop.survive();
            console.log(pop.snapshot());
        }
        var die = oribir.util.range(1, 7);
    }
})();
