CREATE DATABASE IF NOT EXISTS DOHaD;
USE DOHaD;
DROP TABLE IF EXISTS papers;
CREATE TABLE papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toxicant VARCHAR(100),
    pmid VARCHAR(100),
    journal TEXT,
    title TEXT,
    abstract LONGTEXT,
    pubYear INT,
    dose VARCHAR(255),
    country VARCHAR(255),
    organ VARCHAR(255),
    species VARCHAR(255)
);
