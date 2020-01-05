// MODULE PATTERN

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

    // Return object containing public interface
    return {
        addItem: function(type, desc, value) {
            var toAdd;
            var ID = 0;
            // Want next ID to be last item's ID + 1
            // Calculate ID
            if(data.allItems[type].length > 0) ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            if(type === 'inc') {
                toAdd = new Income(ID, desc, value);
            }
            else {
                toAdd = new Expense(ID, desc, value);
            }

            // Can use type to access correct array in object
            data.allItems[type].push(toAdd);

            // Update total
            data.totals[type] += value;

            // Return the new element for use in other modules
            return toAdd;
        },
        // Testing function
        getTotal: function(type) {
            return data.totals[type];
        }
    }

})();

// UI CONTROLLER
var UIController = (function() {
    var DOMstrs = {
        // Form
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        addBtn: '.add__btn',
        // List of items
        incList: '.income__list',
        expList: '.expenses__list',
        // Top summary
        netBudget: '.budget__value',
        incTotal: '.budget__income--value',
        expTotal: '.budget__expenses--value'
    }

    return {
        // Retrieve inputs from page
        getInput: function() {
            // Get all the values
            return {
                desc: document.querySelector(DOMstrs.inputDesc).value, // description
                value: parseInt(document.querySelector(DOMstrs.inputVal).value), // how much money
                type: document.querySelector(DOMstrs.inputType).value // plus or minus
            }
        },
        // Retrieve DOM strings for each selector
        getDOMStrs: function() {
            return DOMstrs;
        },
        // Add list item to UI
        addListItem: function(object, type) {
            // object can be Income or Expense

            // Create HTML string with placeholder
            var html = 
            `<div class="item clearfix" id="income-%id%">
                <div class="item__description">%desc%</div>
                <div class="right clearfix">
                    <div class="item__value">${type === 'exp'? '-': '+'} %value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            
            // Replace placeholder with real data
            var newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%desc%', object.desc);
            newHtml = newHtml.replace('%value%', object.value);

            // Insert HTML into DOM
            
            document.querySelector(DOMstrs[type+'List']).insertAdjacentHTML('afterbegin', newHtml);
        },
        // Update totals
        // Private function to update totals
        updateTotals: function(incTotal, expTotal) {
            document.querySelector(DOMstrs.incTotal).textContent = incTotal;
            document.querySelector(DOMstrs.expTotal).textContent = expTotal;
            document.querySelector(DOMstrs.netBudget).textContent = incTotal - expTotal;
        },
        // Clear the input fields - used after adding an item
        clearFields: function() {
            // Select all the input fields
            var fields = document.querySelectorAll(DOMstrs.inputDesc + ', ' + DOMstrs.inputVal);
            // Get a copy of the fields
            var fieldArr = Array.prototype.slice.call(fields);
            // Clear them
            fieldArr.forEach(function(cur, idx, arr) {
                cur.value = '';
            });
            // Move keyboard focus back to the first input field
            fieldArr[0].focus();
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

    // Private function to update summary
    function updateSummary() {
        var incTotal = budgetController.getTotal('inc');
        var expTotal = budgetController.getTotal('exp')
        UICtrl.updateTotals(incTotal, expTotal);
    }

    var ctrlAddItemFunction = function() {
        var inputs, item;

        // 1. Get input values
        inputs = UICtrl.getInput();
        
        // 2. Add the item to budget controller
        item = budgetCtrl.addItem(inputs.type, inputs.desc, inputs.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(item, inputs.type);
                
        // 6. Clear the input fields
        UICtrl.clearFields();

        // 4. Calculate the new balance
        updateSummary();

        // 5. Display the budget        
    };

    return {
        init: function() {
            updateSummary();
            setupEventListeners();
        }
    }

})(budgetController, UIController);

// Initialize everything
controller.init();