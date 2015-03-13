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
    private _traits: number[];
    private _flight: number;

    constructor(
        private _zygote: string[] = ['ATGC', 'ATGC'],
        private _fitness: number = 0
    ) {
        console.log('constructor');
        this._traits = [15, 15];
        this._flight = 15 + this._traits[1] - this._traits[0];
        this.print();
    }
    print() {
        console.log(this._zygote);
        console.log(this.phenotype());
        console.log(this.fitness());
    }
    fitness(): number {return this._fitness;}
    phenotype(): number[] {return this._traits.concat(this._flight);}

    flight() {
        this._fitness = this._flight / 31;
    }

    gametogenesis(): string {
        return '';
    }
}

export class Population {
    private members: Individual[];

    constructor(private size: number) {
        this.members = [];
        for (var i=0; i<size; ++i) {
            this.members.push(new Individual());
        }
    }
    print() {console.log(this.members);}
}

}
