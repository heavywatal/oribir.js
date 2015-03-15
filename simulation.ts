module random {
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
}

module simulation {

var genotype_space = [[0, 4, 8, 12], [0, 1, 2, 3]]

function sum(lhs, rhs) {return lhs + rhs;}

export class Individual {
    private _traits: number[];
    private _fitness: number = 0;

    static mutation_rate: number = 0.1 * 4 / 3;

    constructor(
        private _zygote: number[][] = [[8, 0, 8, 0], [8, 0, 8, 0]]
    ) {
        this._traits = [this._zygote[0].slice(0, 1).concat(
                        this._zygote[1].slice(0, 1)).reduce(sum) / 2,
                        this._zygote[0].slice(2, 4).concat(
                        this._zygote[1].slice(2, 4)).reduce(sum) / 2];
        this._traits.push(15 + this._traits[1] - this._traits[0]);
    }
    print() {
        console.log(this._zygote);
        console.log(this.phenotype());
        console.log(this.fitness());
    }
    fitness(): number {return this._fitness;}
    phenotype(): number[] {return this._traits;}

    fight() {
        this._fitness = this._traits[2] / 31;
    }

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
        for (var i=0; i<4; ++i) {
            gamete.push(this._zygote[random.randrange(2)][i]);
        }
        if (random.bernoulli(Individual.mutation_rate)) {
            var locus = random.randrange(gamete.length);
            gamete[locus] = random.randrange(4) * (4 - 3 * (locus % 2));
        }
        return gamete;
    }
}

export class Population {
    private _members: Individual[];

    constructor(private _size: number) {
        this._members = [];
        for (var i=0; i<this._size; ++i) {
            this._members.push(new Individual());
        }
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
        for (var i=0; i<this._members.length; ++i) {
            this._members[i].fight();
        }
        var survivors = [];
        for (var i=0; i<this._size; ++i) {
            survivors.push(this._members[random.randrange(this._size)]);
        }
        this._members = survivors;
    }

    snapshot(): number[][] {
        var n = this._members.length;
        var output = [[], [], []];
        for (var i=0; i<n; ++i) {
            var p = this._members[i].phenotype();
            for (var j=0; j<3; ++j) {
                output[j].push(p[j]);
            }
        }
        return output;
    }

    print() {
        console.log(this._members);
    }
    test() {
        var ind = this._members[0];
    }
}

}

(function () {if (typeof window == 'undefined') {
    var pop = new simulation.Population(4);
    pop.test();
    for (var t=0; t<3; ++t) {
        pop.reproduce();
        pop.survive();
        console.log(pop.snapshot());
    }
}})();
