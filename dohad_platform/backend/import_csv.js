const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function importCsv() {
    console.log('Connecting to MySQL to initialize the DOHaD database...');
    // Connect without specifying a database to create it first
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'D3vilishere',
    });

    try {
        await connection.query('CREATE DATABASE IF NOT EXISTS DOHaD;');
        await connection.query('USE DOHaD;');
        
        await connection.query('DROP TABLE IF EXISTS papers;');
        await connection.query(`
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
        `);
        console.log('DOHaD database and papers table successfully initialized!');

        console.log('Reading CSV file and importing data... This may take a moment.');
        const csvPath = path.join(__dirname, '../frontend/assets/prenatal_heavy_metals.csv');
        
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let isFirstLine = true;
        let count = 0;
        
        for await (const line of rl) {
            if (isFirstLine) {
                isFirstLine = false; // Skip header
                continue;
            }
            
            // Simple CSV parsing that respects quotes
            const row = parseCsvLine(line);
            if (row.length < 10) continue; // Skip malformed or empty lines
            
            // Header: Metal,PMID,Journal,Title,Abstract,Year,Dose (ppm),Country,Organs,Species
            const [toxicant, pmid, journal, title, abstract, pubYear, dose, country, organ, species] = row;
            
            const yearVal = pubYear ? parseInt(pubYear) : null;
            
            await connection.execute(
                'INSERT INTO papers (toxicant, pmid, journal, title, abstract, pubYear, dose, country, organ, species) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [toxicant, pmid, journal, title, abstract, yearVal, dose, country, organ, species]
            );
            count++;
            
            if (count % 500 === 0) {
                console.log(`Imported ${count} records...`);
            }
        }
        
        console.log(`Successfully imported ${count} records into the DOHaD database!`);
    } catch (error) {
        console.error('Error importing CSV data:', error);
    } finally {
        await connection.end();
    }
}

// Helper to handle commas inside quoted CSV fields
function parseCsvLine(text) {
    const ret = [''];
    let i = 0;
    let p = '';
    let s = true;
    for (let l in text) {
        l = text[l];
        if ('"' === l) {
            s = !s;
            if ('"' === p) {
                ret[i] += '"';
                l = '-';
            } else if (p === '') {
                l = '-';
            }
        } else if (s && ',' === l) {
            l = ret[++i] = '';
        } else {
            ret[i] += l;
        }
        p = l;
    }
    return ret.map(item => item.trim());
}

importCsv();
