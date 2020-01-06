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
        },
        budget: 0,
        percentage: -1
    }

    // Private helper function to update totals
    function updateTotalsAndRecalculate(type, value) {
        // Update total
        data.totals[type] += value;

        // Update budget
        data.budget = data.totals.inc - data.totals.exp;

        // Update percentage
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }
        else {
            data.percentage = -1;
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

            updateTotalsAndRecalculate(type, value);

            // Return the new element for use in other modules
            return toAdd;
        },
        deleteItem: function(type, id) {
            // Remove the correct item
            // Use map function to get list of ids
            var ids = data.allItems[type].map(function(cur) {
                return cur.id;
            });

            var idxToRemove = ids.indexOf(id);

            // Save the object to be removed to update totals
            var objToRemove = data.allItems[type][idxToRemove];

            // Remove the object from the array
            data.allItems[type] = data.allItems[type].splice(idxToRemove, 1); // remove 1 element from idx

            // Update total
            updateTotalsAndRecalculate(type, -objToRemove.value); // pass negative to subtract
        },
        // Testing function
        getBudget: function() {
            return {
                budget: data.budget,
                incTotal: data.totals.inc,
                expTotal: data.totals.exp,
                percentage: data.percentage
            }
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
        container: '.container',
        // Top summary
        netBudget: '.budget__value',
        incTotal: '.budget__income--value',
        expTotal: '.budget__expenses--value',
        month: '.budget__title--month',
        percentageDisplay: '.budget__expenses--percentage'    
    }

    return {
        // Retrieve inputs from page
        getInput: function() {
            // Get all the values
            return {
                desc: document.querySelector(DOMstrs.inputDesc).value, // description
                value: parseFloat(document.querySelector(DOMstrs.inputVal).value), // how much money
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
            `<div class="item clearfix" id="%id%">
                <div class="item__description">%desc%</div>
                <div class="right clearfix">
                    <div class="item__value">${type === 'exp'? '-': '+'} %value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            
            // Replace placeholder with real data
            var newHtml = html.replace('%id%', type + '-' + object.id);
            newHtml = newHtml.replace('%desc%', object.desc);
            newHtml = newHtml.replace('%value%', object.value);

            // Insert HTML into DOM
            // afterbegin so that most recent item is at the top
            document.querySelector(DOMstrs[type+'List']).insertAdjacentHTML('afterbegin', newHtml);
        },
        removeListItem: function(id, type) {
            // Remove object from DOM
            var elem = document.querySelector('#' + type + '-' + id);
            elem.remove();

            // can alternatively use:
            // elem.parentNode.removeChild(elem);
        },
        // Update totals
        // Private function to update totals
        displayBudget: function(object) {
            // Update UI for different totals and subtotals
            document.querySelector(DOMstrs.incTotal).textContent = '+ ' + object.incTotal;
            document.querySelector(DOMstrs.expTotal).textContent = '- ' + object.expTotal;
            document.querySelector(DOMstrs.netBudget).textContent = object.budget;

            // Toggle visibility depending on if percentage should be displayed
            if(object.percentage !== -1) { // If there is a valid percentage
                document.querySelector(DOMstrs.percentageDisplay).style.visibility = 'visible';
                document.querySelector(DOMstrs.percentageDisplay).textContent = object.percentage + '%';
            } 
            else { // Might not be valid
                document.querySelector(DOMstrs.percentageDisplay).style.visibility = 'hidden';
            }
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
        },
        // 
        updateDate: function(month) {
            // Update date in DOM
            document.querySelector(DOMstrs.month).textContent = month;
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

        // Add event handling for Enter button to add
        document.addEventListener('keydown', function(event) {
            // Note: older browsers may use 'which' property
            if(event.keyCode === 13 || event.which === 13) {
                // Enter key was pressed
                ctrlAddItemFunction();
          }
        });

        // Add event handler to delete individual list items
        // Use Event Delegation to handle events for DOM items not existing yet
        document.querySelector(DOMstrs.container).addEventListener('click', ctrlDeleteItemFunction);
    };

    // Private function to update summary
    function updateSummary() {
        // Get the budget from the budget controller
        var obj = budgetCtrl.getBudget();

        // Tell the UI to update it
        UICtrl.displayBudget(obj);
    }

    function getAndUpdateDate() {
        // Month name
        var date = new Date();  // Date today
        var month = date.toLocaleString('default', { month: 'long' });
        UICtrl.updateDate(month);
    }

    // Callback for adding item
    var ctrlAddItemFunction = function() {
        var inputs, item;

        // 1. Get input values
        inputs = UICtrl.getInput();

        // Handle invalid inputs
        if (inputs.desc === '' || isNaN(inputs.value) || inputs.value <= 0) return;
        
        // 2. Add the item to budget controller
        item = budgetCtrl.addItem(inputs.type, inputs.desc, inputs.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(item, inputs.type);
                
        // 6. Clear the input fields
        UICtrl.clearFields();

        // 4. Calculate and update the new balance
        updateSummary();
    };

    // Callback for deleting item
    var ctrlDeleteItemFunction = function(event) {
        // Traverse DOM to get to the ID
        // Hardcoded DOM structure
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // Leverage fact that only items in this container have an ID
        if (itemID) {
            // Split this into a more convenient form
            var splitID = itemID.split('-');
            var type = splitID[0];
            var id = parseInt(splitID[1]);

            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, id);

            // 2. Delete item from UI
            UICtrl.removeListItem(id, type);

            // 3. Update UI to show new summarized info
            updateSummary();
        }
    }

    return {
        init: function() {
            updateSummary();
            setupEventListeners();
            getAndUpdateDate();
        }
    }

})(budgetController, UIController);

// Initialize everything
controller.init();