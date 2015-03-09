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
        function Individual(gamete1) {
            this.gamete1 = gamete1;
            console.log('constructor');
        }
        Individual.prototype.print = function () {
            console.log(this.gamete1);
        };
        return Individual;
    })();
    simulation.Individual = Individual;
    var Population = (function () {
        function Population(size) {
            this.size = size;
            this.members = [];
            for (var i = 0; i < size; ++i) {
                this.members.push(new Individual(String(i)));
            }
        }
        Population.prototype.print = function () {
            console.log(this.members);
        };
        return Population;
    })();
    simulation.Population = Population;
})(simulation || (simulation = {}));
