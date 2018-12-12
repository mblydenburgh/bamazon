const inquirer = require('inquirer');
const mysql = require('promise-mysql');
const Table = require('cli-table');
require("dotenv").config();
require("./keys");

const dbPassword = process.env.DB_PASSWORD;
const numRegex = /^[0-9]+$/; //regular expression to accept only number input
let sql;

function createTable(headers) {
    //try to take passed in headers to dynamically update names from running initial .sql file
    //and beautifying the header names automatically
    let table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity","Product Sales"],
        colWidths: [10, 45, 15, 10, 10,15]
    });
    return table;
}

function buyPromptID(data) {
    return new Promise((resolve, reject) => {
        //make array of valid item id's to validate against user input
        let validIDs = data.map(item => { return item.item_id });
        console.log(validIDs);
        inquirer.prompt([
            {
                message: 'Enter the product ID you wish to purchase:',
                name: 'itemID'
            }
        ]).then(function (res) {
            let userChoice = res.itemID;
            //check if user input passes number regex and if it is in list of valid IDs
            if (numRegex.test(userChoice) && validIDs.indexOf(Number(userChoice)) > -1) {
                console.log(`valid id`);
                resolve(Number(userChoice));
            }
            else {
                console.log(`Please enter a valid ID`);
                buyPromptID(data);
            }
        });
    })

}

function buyPromptQty(itemID, data) {
    return new Promise((resolve, reject) => {
        itemID = Number(itemID);
        const itemQty = Number(data[itemID - 1].stock_quantity);

        console.log(`We have ${itemQty} left`);
        inquirer.prompt([
            {
                message: 'Enter the quantity for your order:',
                name: 'orderQty'
            }
        ]).then(function (res) {
            let userChoice = res.orderQty;

            //check if user input passes numRegex, and if enough items are in stock for order
            if (numRegex.test(userChoice) && itemQty >= Number(userChoice)) {
                console.log(`we have enough to cover the order`);
                resolve(Number(userChoice));
            }
            else {
                console.log(`Please enter a valid order number`);
                buyPromptQty(itemID, data);
            }
        });
    })

}

function calculateOrderTotal(itemID, itemQty,data) {
    console.log(`finding order total for id:${itemID} & qty:${itemQty}`);
    const unitPrice = data[itemID-1].price;
    return (unitPrice*itemQty);
}

/* DATABASE CONNECTION CONFIG

    for working in cloud9:
        user: "mblydenburgh"
        password: ""
    
    for working on macbook locally:
        user:"root"
        password: dbPassword,
        database:"bamazon_db"
*/

function connectToDB() {
    //create connection to database using .env for secure connect
    mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: dbPassword,
        database: 'bamazon_db'
    })
        //once connected, query to select all data for displaying to product table
        .then(async function (connection) {
            sql = `SELECT * FROM products`;
            let data = await connection.query(sql);

            const headers = Object.keys(data[0]);
            const table = createTable(headers);
            data.forEach(row => {
                let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty, product_sales: sales } = row;
                if(!sales){
                    sales = 0
                }
                table.push([id, name, department, `$${price}`, qty, sales]);
            });
            //display table of products and prompt user to select which item
            console.log(table.toString());

            //once product list is displayed, prompt user for id and quantity of their purchase order
            let itemID = await buyPromptID(data);
            let itemQty = await buyPromptQty(itemID, data);
            let orderPrice = calculateOrderTotal(itemID, itemQty,data);
            console.log(`Order Total: ${orderPrice}`);
            
            connection.query(`UPDATE products SET product_sales = product_sales + ? WHERE item_id = ?`,[orderPrice,itemID]);
            return connection.query(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?`, [itemQty, itemID]);
        })
        .then(async function (data) {
            console.log(`Order placed successfully!`);
            console.log(data.message);
            setTimeout(connectToDB,3000);
        })
        .catch(err => console.log(err)
        );
}

connectToDB();