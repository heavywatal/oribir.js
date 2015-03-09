module simulation {

export class Individual {
    fitness: number;
    constructor(private gamete1: string) {
    }
    print() {console.log(this.gamete1);}
}

}
