# The Bamazon Store
A CLI application modeled after an Amazon type buying environment powered by SQL and inquirer.js

## Main Features
Bamazon features three main program environments- a customer, manager, and supervisor. Each has different SQL query powered

### Running Bamazon Customer
Bamazon can be ran by entering `node bamazon_customer.js` in the command line from the project folder. The customer will be greeting with the following screen:

![Customer Start](./images/customer-start.PNG)

To purchase an item, enter to corresponding item ID. The customer will then be asked to enter how many items to purchase. The database will update and wil display the updated product sales:

![Customer Purchase](./images/customer-purchase.PNG)

### Running Bamazon Manager
The bamazon manager is started by entering `node bamazon_manager.js`. The manager is able to perform more actions than a regular customer:

![Manager Start](./images/manager-start.PNG)

Viewing All Products:

![Manager View Products](./images/manager-view.PNG)

Viewing Low Inventory:

![Manager View Low Inventory](./images/manager-low.PNG)

Adding Inventory to existing products:

![Restocking Inventory](./images/manager-addstock.PNG)

Adding New Products:

![Adding New Products](./images/manager-addproduct.PNG)
![Adding Prodcut to Bad Department](./images/manager-badproduct.PNG)

### Running Bamazon Supervisor
The bamazon supervisor is run by entering `node bamazon_supervisor.js`. The supervisor can view product sales by department, and add new departments

Product Sales by department:

![Supervisor sales by department](./images/supervisor-view.PNG)

Adding a new department:

![Supervisor add new department](./images/supervisor-add.PNG)
