USE c9;

DROP TABLE IF EXISTS products;

CREATE TABLE products(
	item_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (255),
    department_name VARCHAR(255),
    price FLOAT(6,2),
    stock_quantity INTEGER
);

INSERT INTO products (product_name,department_name,price,stock_quantity)
VALUES 
("15in Macbook Pro","Electronics",2999.99,15),("13in Macbook Pro","Electronics",1699.99,20),("Macbook Air","Electronics",1350.00,30),
("Instant Pot","Kitchenware",150.00,30),("Fifty Shades of Chicken","Books",19.99,10),("Cracking the Coding Interview","Books",24.99,10),
("Divinity Original Sin 2","Videogames",29.99,10),("Super Smash Brothers Ultimate","Videogames",59.99,30),("12in Lodge Cast Iron Skillet","Kitchenware",19.99,5),
("Xin Dynasty Porcelain Plateware","Kitchenware",9999.99,1);