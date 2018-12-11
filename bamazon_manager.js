const inquirer = require('inquirer');
const mysql = require('promise-mysql');
const Table = require('cli-table');
require("dotenv").config();
require("./keys");

const dbPassword = process.env.DB_PASSWORD;
const numRegex = /^[0-9]+$/; //regular expression to accept only number input
let sql;
let data;
let table;

function createTable(headers) {
    //try to take passed in headers to dynamically update names from running initial .sql file
    //and beautifying the header names automatically
    let table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity"],
        colWidths: [10, 45, 15, 10, 10]
    });
    return table;
}

function managerOptionPrompt() {
    return new Promise((resolve, reject) => {
        let managerOptions = ['View Products', 'View Low Inventory', 'Add Inventory', 'Add Product', 'Quit'];
        inquirer.prompt([
            {
                type: 'list',
                message: 'Choose a manager option',
                name: 'managerChoice',
                choices: managerOptions
            }
        ])
            .then(function (res) {
                const userChoice = res.managerChoice;
                resolve(userChoice);
            })
    });
}

function promptID(data) {
    return new Promise((resolve, reject) => {
        //make array of valid item id's to validate against user input
        let validIDs = data.map(item => { return item.item_id });
        console.log(validIDs);
        inquirer.prompt([
            {
                message: 'Enter the product ID you wish to add to:',
                name: 'itemID'
            }
        ]).then(function (res) {
            let userChoice = res.itemID;
            //check if user input passes number regex and if it is in list of valid IDs
            if (numRegex.test(userChoice) && validIDs.indexOf(Number(userChoice)) > -1) {
                resolve(Number(userChoice));
            }
            else {
                console.log(`Please enter a valid ID`);
                buyPromptID(data);
            }
        });
    });
}

function promptQty(itemID, data) {
    return new Promise((resolve, reject) => {
        itemID = Number(itemID);
        inquirer.prompt([
            {
                message: 'Enter the quantity for your order:',
                name: 'orderQty'
            }
        ]).then(function (res) {
            let userChoice = res.orderQty;

            //check if user input passes numRegex, and if enough items are in stock for order
            if (numRegex.test(userChoice)) {
                console.log(`Adding ${userChoice} to inventory`);
                resolve(Number(userChoice));
            }
            else {
                console.log(`Please enter a valid number`);
                buyPromptQty(itemID, data);
            }
        });
    });
}

function connectToDB() {
    mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: dbPassword,
        database: 'bamazon_db'
    })
        .then(async function (connection) {
            //prompt for manager option in order to determine what DB query to run
            const managerOption = await managerOptionPrompt();
            console.log(`You chose ${managerOption}`);

            //with choice selected, direct to correct DB query
            switch (managerOption) {
                case 'View Products':
                    sql = `SELECT * FROM products`;
                    data = await connection.query(sql);
                    table = createTable();
                    data.forEach(row => {
                        let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty } = row;
                        table.push([id, name, department, `$${price}`, qty]);
                    });
                    console.log(table.toString());
                    break;
                case 'View Low Inventory':
                    sql = `SELECT * FROM products WHERE stock_quantity < 5`;
                    data = await connection.query(sql);
                    table = createTable();
                    data.forEach(row => {
                        let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty } = row;
                        table.push([id, name, department, `$${price}`, qty]);
                    });
                    console.log(table.toString());
                    break;
                case 'Add Inventory':
                    data = await connection.query(`SELECT * FROM products`);
                    let itemID = await promptID(data);
                    let itemQty = await promptQty(itemID, data);
                    connection.query(`UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?`, [itemQty, itemID]);
                    console.log(`Adding ${itemQty} units to id:${itemID}`);
                    break;
                case 'Add Product':
                    break;
                case 'Quit':
                    console.log(`Buhh bye now! Come back soon, ya hear?`);
                    process.exit();
                    break;
            }

        })
        .then(function (data) {
            connectToDB();
        })
        .catch(error => console.log(error));
}

connectToDB();