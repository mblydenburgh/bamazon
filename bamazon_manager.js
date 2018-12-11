const inquirer = require('inquirer');
const mysql = require('promise-mysql');
const Table = require('cli-table');
require("dotenv").config();
require("./keys");

const dbPassword = process.env.DB_PASSWORD;
const numRegex = /^[0-9]+$/; //regular expression to accept only number input
let sql;
let data;

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
        let managerOptions = ['View Products', 'View Low Inventory', 'Add Inventory', 'Add Product','Quit'];
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
                    const table = createTable();
                    data.forEach(row => {
                        let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty } = row;
                        table.push([id, name, department, `$${price}`, qty]);
                    });
                    console.log(table.toString());
                    break;
                case 'View Low inventory':
                    sql = `SELECT * FROM products WHERE stock_quantity < 5`;
                    return connection.query(sql);
                case 'Add Inventory':
                    data = connection.query(`SELECT * FROM products`);
                    let itemID = await promptID(data);
                    let itemQty = await promptQty(itemID, data)
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