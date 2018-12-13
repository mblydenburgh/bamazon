const inquirer = require('inquirer');
const mysql = require('promise-mysql');
const Table = require('cli-table');
require("dotenv").config();
require("./keys");

const dbPassword = process.env.DB_PASSWORD;
const numRegex = /^[0-9]+$/; //regular expression to accept only number input
const nameRegex = /^[\w\s\d()]+$/; //regular expression to accept alphanumeric and parentheses for product names
const priceRegex = /^[\d]{0,4}[.]\d{2}$/ //regular expression to accept only money format XXXX.XX
let sql;
let data;
let table;

function createTable(headers) {
    //try to take passed in headers to dynamically update names from running initial .sql file
    //and beautifying the header names automatically
    let table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity","Product Sales"],
        colWidths: [10, 45, 15, 10, 10,15]
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

function promptQty() {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                message: 'Enter the initial inventory stock:',
                name: 'itemQty'
            }
        ]).then(function (res) {
            let itemQty = res.itemQty;

            //check if input passes numRegex
            if (numRegex.test(itemQty)) {
                resolve(Number(itemQty));
            }
            else {
                console.log(`Please enter a valid number`);
                promptQty();
            }
        });
    });
}

function promptName(){
    return new Promise((resolve,reject)=>{
        inquirer.prompt([
            {
                message:'Enter a product name',
                name:'itemName'
            }
        ])
        .then(function(res){
            let itemName = res.itemName;
            if(nameRegex.test(itemName)){
                resolve(itemName);
            }
            else{
                console.log(`Please enter a valid product name`);
                promptName();
            }
        });
    });
}

function promptDepartment(validDepartments){
    return new Promise((resolve,reject)=>{
        inquirer.prompt([
            {
                message:'Enter a department name',
                name:'departmentName'
            }
        ])
        .then(function(res){
            let departmentName = res.departmentName;
            if(nameRegex.test(departmentName) && validDepartments.indexOf(departmentName) > -1){
                resolve(departmentName);
            }
            else{
                console.log(`Please enter a valid department name with only alphanumeric characters and parentheses, and check with a supervisor to ensure the department exists!`);
                promptDepartment(validDepartments);
            }
        });
    });
}

function promptPrice(){
    return new Promise((resolve,reject)=>{
        inquirer.prompt([
            {
                message:'Enter the selling price, up to 9999.99 (without $)',
                name:'itemPrice'
            }
        ])
        .then(function(res){
            let itemPrice = res.itemPrice;
            if(priceRegex.test(itemPrice)){
                resolve(Number(itemPrice))
            }
            else{
                console.log(`Enter a valid price`);
                promptPrice();
            }
        })
    });
}

function connectToDB() {
    mysql.createConnection({
        host: '127.0.0.1',
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
                        let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty, product_sales: sales } = row;
                        table.push([id, name, department, `$${price}`, qty,sales]);
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
                    let validDepartments = await connection.query(`SELECT department_name FROM products`);
                    let itemName = await promptName();
                    let departmentName = await promptDepartment(validDepartments);
                    let price = await promptPrice();
                    let quantity = await promptQty();
                    console.log(`Adding ${quantity} ${itemName} to the ${departmentName} department for $${price}`);
                    connection.query(`INSERT INTO products (product_name,department_name,price,stock_quantity,product_sales)
                                      VALUES (?,?,?,?,?)`,[itemName,departmentName,price,quantity,0]);
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