module simulation {

export class Individual {
    fitness: number;
    constructor(private gamete1: string) {
        console.log('constructor');
    }
    print() {console.log(this.gamete1);}
}

}
