module random {

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

export class Individual {
    fitness: number;

    constructor(private gamete1: string) {
        console.log('constructor');
    }
    print() {console.log(this.gamete1);}
}

export class Population {
    private members: Individual[];

    constructor(private size: number) {
        this.members = [];
        for (var i=0; i<size; ++i) {
            this.members.push(new Individual(String(i)));
        }
    }
    print() {console.log(this.members);}
}

}
