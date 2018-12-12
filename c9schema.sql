USE c9;

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS departments;

CREATE TABLE products(
	item_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (255),
    department_name VARCHAR(255),
    price FLOAT(6,2),
    stock_quantity INTEGER,
    product_sales FLOAT(6,2)
);

INSERT INTO products (product_name,department_name,price,stock_quantity,product_sales)
VALUES 
("15in Macbook Pro","Electronics",2999.99,15,100),("13in Macbook Pro","Electronics",1699.99,20,200),("Macbook Air","Electronics",1350.00,30,0),
("Instant Pot","Kitchenware",150.00,30,0),("Fifty Shades of Chicken","Books",19.99,10,0),("Cracking the Coding Interview","Books",24.99,10,0),
("Divinity Original Sin 2","Videogames",29.99,10,0),("Super Smash Brothers Ultimate","Videogames",59.99,30,0),("12in Lodge Cast Iron Skillet","Kitchenware",19.99,5,0),
("Xin Dynasty Porcelain Plateware","Kitchenware",9999.99,1,0);

CREATE TABLE departments(
  department_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(255),
  overhead_costs FLOAT(6,2)
);

INSERT INTO departments (department_name,overhead_costs)
VALUES
("Electronics",1000.00),("Books",300.00),("Kitchenware",500.00),("Videogames",200.00);