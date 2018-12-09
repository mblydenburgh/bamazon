const inquirer = require('inquirer');
const mysql = require('promise-mysql');
const Table = require('cli-table');
require("dotenv").config();
require("./keys");

const dbPassword = process.env.DB_PASSWORD;
const numRegex = /^[0-9]$/g; //regular expression to accept only number input
let sql;


function createTable(headers) {
    //try to take passed in headers to dynamically update table name from running initial .sql file
    //and beautifying the header names
    let table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity"],
        colWidths: [10, 45, 15, 10, 10]
    });
    return table;
}

function buyPromptID(data) {
    //make array of valid item id's to validate against user input
    let validIDs = data.map(item=>{return item.item_id});
    console.log(validIDs);
    inquirer.prompt([
        {
            message: 'Enter the product ID you wish to purchase:',
            name: 'itemID'
        }
    ]).then(function (res) {
        let userChoice = res.itemID;
        //check if user input passes number regex and if it is in list of valid IDs
        if(numRegex.test(userChoice) && validIDs.indexOf(userChoice)){
            console.log(`valid id`);
            buyPromptQty(userChoice,data);
        }
        else{
            console.log(`Please enter a valid ID`);
            buyPromptID(data);
        }
    });
}

function buyPromptQty(itemID,data) {
    console.log(`buy prompt id:${itemID}`);
    console.log(data[itemID-1]);
    const itemQty = Number(data[itemID-1].stock_quantity);
    console.log(`We have ${itemQty} left`); 
    inquirer.prompt([
        {
            message:'Enter the quantity for your order:',
            name: 'orderQty'
        }
    ]).then(function(res){
        let userChoice = Number(res.orderQty);
        console.log(`userchoice: ${userChoice}`);
        if(numRegex.test(userChoice) && itemQty >= userChoice){
            console.log(`we have enough to cover the order`);
        }
        else{
            console.log(`Enter a valid quantity number`);
            buyPromptQty(itemID,data);
        }
    });
}

//create connection to database using .env for secure connect
mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: dbPassword,
    database: 'bamazon_db'
})
    //once connected, query to select all data for displaying to product table
    .then(function (connection) {
        sql = `SELECT * FROM products`;
        let data = connection.query(sql);
        connection.end();
        return data;
    })
    .then(function (data) {
        const headers = Object.keys(data[0]);
        const table = createTable(headers);
        data.forEach(row => {
            let { item_id: id, product_name: name, department_name: department, price, stock_quantity: qty } = row
            // console.log(`*****PUSHING ROW*****`)
            // console.log(id, name, department, price, qty);
            table.push([id, name, department, `$${price}`, qty])
        });
        //display table of products and prompt user to select which item
        console.log(table.toString());
        buyPromptID(data);
    })
    .catch(err => console.log(err)
    );