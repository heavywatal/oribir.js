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
})(simulation || (simulation = {}));
