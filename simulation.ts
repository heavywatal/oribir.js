module oribir.util {
    export function range(start, stop=null) {
        var result = []
        if (stop == null) {
            stop = start;
            start = 0;
        }
        for (; start<stop; ++start) {
            result.push(start);
        }
        return result;
    }

    export function partial_sums(array: number[]) {
        var s = 0;
        var result = [];
        for (var i=0; i<array.length; ++i) {
            s += array[i];
            result.push(s);
        }
        return result;
    }
}

module oribir.random {
    export function uniform(min: number, max: number) {
        return min + (max - min) * Math.random();
    }

    export function randrange(start, stop=null) {
        if (stop == null) {
            return Math.floor(Math.random() * start);
        } else {
            return Math.floor(Math.random() * (stop - start)) + start;
        }
    }

    function randint(a, b) {
        return randrange(a, b + 1);
    }

    export function bernoulli(prob) {
        return Math.random() < prob;
    }

    export function binomial(size, prob) {
        var cnt = 0;
        for (var i=0; i<size; ++i) {
            if (bernoulli(prob)) {++cnt;}
        }
        return cnt;
    }

    export function sample(array, k: number) {
        var n = array.length;
        var result = [];
        for (var i=0; i<k; ++i) {
            var j = randrange(n - i);
            result.push(array[j]);
            array[j] = array[n - i - 1];
        }
        return result;
    }
}

module oribir {

var genotype_space = [[0, 4, 8, 12], [0, 1, 2, 3]];
var initial_gamete = [2, 1, 2, 1, 2, 1, 2, 1];

function sum(lhs, rhs) {return lhs + rhs;}

export class Individual {
    private _traits: number[];

    static _MUTATION_RATE: number = 0.1 * 4 / 3;
    static set MUTATION_RATE(mu: number) {
        this._MUTATION_RATE = mu * 4 / 3;
    }

    static get MAX_WING(): number {return 12;}
    static get MAX_FLIGHT(): number {return 24;}

    constructor(
        private _zygote: number[][] = [initial_gamete, initial_gamete]
    ) {console.log(this._zygote);
        this._traits = [this._zygote[0].slice(0, 4).concat(
                        this._zygote[1].slice(0, 4)).reduce(sum) / 2,
                        this._zygote[0].slice(4, 8).concat(
                        this._zygote[1].slice(4, 8)).reduce(sum) / 2];
        this._traits.push(Individual.MAX_FLIGHT / 2 +
                          this._traits[1] - this._traits[0]);
    }

    get flight(): number {return this._traits[2];}
    get phenotype(): number[] {return this._traits;}

    copulate(partner: Individual): Individual[] {
        if (false) {return [];}
        var children = [];
        for (var i=0; i<4; ++i) {
            children.push(new Individual([this.gametogenesis(), partner.gametogenesis()]));
        }
        return children;
    }

    gametogenesis(): number[] {
        var gamete = [];
        for (var i=0; i<initial_gamete.length; ++i) {
            if (random.bernoulli(Individual._MUTATION_RATE)) {
                gamete.push(random.randrange(4));
                // 1/4 remains the same -> correction in mu setter
            } else {
                gamete.push(this._zygote[random.randrange(2)][i]);
            }
        }
        return gamete;
    }
}

export class Population {
    private _members: Individual[];
    private _landscape;
    static _OPTIMA = {
        '0': 0.97,
        '1': 0.50,
        '2': 0.03,
    };

    constructor(private _size: number, environment='1') {
        this._members = [];
        for (var i=0; i<this._size; ++i) {
            this._members.push(new Individual());
        }
        var sigma = 0.5;
        var coef = -0.5 / Math.pow(sigma, 2);
        this._landscape = function(flight) {
            var base = flight/Individual.MAX_FLIGHT - Population._OPTIMA[environment];
            return Math.exp(coef * Math.pow(base, 2));
        };
    }

    reproduce() {
        var half = Math.floor(this._members.length / 2);
        var offsprings = [];
        for (var i=0; i<half; ++i) {
            var mother = this._members[i];
            offsprings.push.apply(offsprings, mother.copulate(this._members[i+half]));
        }
        this._members = offsprings;
    }

    survive() {
        var fitness_values = [];
        for (var i=0; i<this._members.length; ++i) {
            fitness_values.push(this._landscape(this._members[i].flight));
        }
        var indices = roulette(fitness_values, this._size);
        var survivors = [];
        for (var i=0; i<indices.length; ++i) {
            survivors.push(this._members[indices[i]]);
        }
        this._members = survivors;
    }

    snapshot(): number[][] {
        var n = this._members.length;
        var output = [[], [], []];
        for (var i=0; i<n; ++i) {
            var p = this._members[i].phenotype;
            for (var j=0; j<3; ++j) {
                output[j].push(p[j]);
            }
        }
        return output;
    }

    get size(): number {return this._members.length;}

    print() {
        console.log(this._members);
    }
    test() {
        var ind = this._members[0];
    }
}

    export function roulette(fitness: number[], n: number=null) {
        if (n === null) {
            n = fitness.length;
        }
        var bounds = oribir.util.partial_sums(fitness);
        var total_fitness = bounds[bounds.length - 1];
        var indices = [];
        for (var i=0; i<n; ++i) {
            var dart = oribir.random.uniform(0, total_fitness);
            for (var j=0; j<bounds.length; ++j) {
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
}

(function () {if (typeof window == 'undefined') {
    var die = oribir.util.range(1, 7);
    console.log(oribir.random.sample(die, 3));
    console.log(oribir.util.partial_sums(die));
    console.log(oribir.roulette(die, 10));

    var pop = new oribir.Population(4, '2');
    pop.test();
    for (var t=0; t<4; ++t) {
        pop.reproduce();
        pop.survive();
        console.log(pop.snapshot());
    }
}})();
