CREATE TABLE products (
product_id INT AUTO_INCREMENT PRIMARY KEY,
part_number VARCHAR(100) NOT NULL UNIQUE,
information TEXT,
manfacturer VARCHAR(255),
image VARCHAR(255),
datasheet TEXT,
mounting_type VARCHAR(100),
part_status VARCHAR(50),
price DECIMAL (10,2) NOT NULL DEFAULT 0.00,
stock INT NOT NULL DEFAULT 0
);