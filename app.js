// IIFE to encapsulate 
var budgetController = (function() {
    // Uses these variables (closures)
    var x = 23;
    var add = function(a) {
        return x + a;
    }

    // Return an object containing all the different public interface functions
    return {
        publicTest: function(b) {
            return add(b);
        }
    }
})();

var UIController = (function() {

})();

// Joins budget and UI modules together
// Pass those controllers into the function expression
var controller = (function(budgetCtrl, UICtrl) {

    var z = budgetCtrl.publicTest(5);
    return {
        anotherPublic: function() {
            console.log(z);
        }
    }

})(budgetController, UIController);