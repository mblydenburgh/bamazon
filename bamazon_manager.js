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
        head: ["Item ID", "Name", "Department", "Price", "Quantity"],
        colWidths: [10, 45, 15, 10, 10]
    });
    return table;
}

function managerOptionPrompt(){
    return new Promise((resolve,reject)=>{

    });
}

function connectToDB(){
    mysql.createConnection({
        host:'localhost',
        user:'root',
        password:dbPassword,
        databse:'bamazon_db'
    })
    .then(async function(connection){
        //prompt for manager option in order to determine what DB query to run
        const managerOption = await managerOptionPrompt();
        
    })
}

connectToDB();