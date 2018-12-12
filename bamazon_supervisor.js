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

function createTable() {
    let table = new Table({
        head: ["Dept ID", "Dept Name", "Overhead", "Product Sales","Total Profit"],
        colWidths: [15, 20, 15, 15, 15]
    });
    return table;
}

function supervisorOptionPrompt() {
    return new Promise((resolve, reject) => {
        let supervisorOptions = ['View Product Sales By Department', 'Create New Department', 'Quit'];
        inquirer.prompt([
            {
                type: 'list',
                message: 'Choose a manager option',
                name: 'supervisorChoice',
                choices: supervisorOptions
            }
        ])
            .then(function (res) {
                const userChoice = res.supervisorChoice;
                resolve(userChoice);
            });
    });
}

function promptDepartmentName(){
    return new Promise((resolve,reject)=>{
       inquirer.prompt([
               {
                   message:'Enter a department name',
                   name:'deptName'
               }
           ])
           .then(function(res){
              let name = res.deptName;
              if(nameRegex.test(name)){
                  resolve(name);
              }
              else{
                  console.log(`Please enter a valid name`);
                  promptDepartmentName();
              }
           });
    });
}

function promptOverhead(){
    return new Promise((resolve,reject)=>{
       inquirer.prompt([
               {
                   message:'Enter overhead costs (XXXX.XX format)',
                   name:'overhead'
               }
           ])
           .then(function(res){
              let costs = res.overhead;
              if(priceRegex.test(costs)){
                  resolve(Number(costs));
              }
              else{
                  console.log(`Please enter a valid name`);
                  promptDepartmentName();
              }
           });
    });
}

function connectToDB() {
    mysql.createConnection({
        host: '127.0.0.1',
        user: 'mblydenburgh',
        password: '',
        database: 'c9'
    })
        .then(async function (connection) {
            //prompt for manager option in order to determine what DB query to run
            const supervisorOption = await supervisorOptionPrompt();
            console.log(`You chose ${supervisorOption}`);

            //with choice selected, direct to correct DB query
            switch (supervisorOption) {
                case 'View Product Sales By Department':
                    sql = `SELECT departments.department_id,departments.department_name,departments.overhead_costs, SUM(products.product_sales)
                           FROM departments
                           INNER JOIN products WHERE departments.department_name = products.department_name
                           GROUP BY departments.department_name;`;
                    data = await connection.query(sql);
                    table = createTable();
                    data.forEach(row => {
                        let { department_id: id, department_name: name, overhead_costs: overhead, ['SUM(products.product_sales)']: sales} = row;
                        let profit = sales - overhead;
                        table.push([id, name, `$${overhead}`, `$${sales}`,`$${profit}`]);
                    });
                    console.log(table.toString());
                    break;
                case 'Create New Department':
                    let name = await promptDepartmentName();
                    let overhead = await promptOverhead();
                    console.log(name,overhead);
                    console.log(typeof name, typeof overhead);
                    sql = `INSERT INTO departments (department_name,overhead_costs) VALUES (?,?)`;
                    connection.query(sql,[name,overhead]);
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