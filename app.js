// IIFE to encapsulate 
// BUDGET CONTROLLER
var budgetController = (function() {
    // Function constructor for Income
    function Income(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    }

    // Function constructor for Expense
    function Expense(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    }

    // Nested structure to relevant incomes and expenses
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

})();

// UI CONTROLLER
var UIController = (function() {
    var DOMstrs = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__type',
        addBtn: '.add__btn'
    }

    return {
        // Retrieve inputs from page
        getInput: function() {
            // Get all the values
            return {
                desc: document.querySelector(DOMstrs.inputDesc).value, // description
                value: document.querySelector(DOMstrs.inputVal).value, // how much money
                type: document.querySelector(DOMstrs.inputType).value // plus or minus
            }
        },
        // Retrieve DOM strings for each selector
        getDOMStrs: function() {
            return DOMstrs;
        }
    };
})();

// GLOBAL APP CONTROLLER
// Joins budget and UI modules together
// Pass those controllers into the function expression
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        // Retrieve DOM string constants
        var DOMstrs = UICtrl.getDOMStrs();

        // Add event handling for the add button
        document.querySelector(DOMstrs.addBtn).addEventListener('click', ctrlAddItemFunction);

        document.addEventListener('keydown', function(event) {
            // Note: older browsers may use 'which' property
            if(event.keyCode === 13 || event.which === 13) {
                // Enter key was pressed
                ctrlAddItemFunction();
          }
        });
    };

    var ctrlAddItemFunction = function() {
        // 1. Get input values
        var inputs = UICtrl.getInput();
        console.log(inputs);
        // 2. Add the item to budget controller

        // 3. Add the item to the UI

        // 4. Calculate the new balance

        // 5. Display the budget
    };

    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }
    }

})(budgetController, UIController);

// Initialize everything
controller.init();