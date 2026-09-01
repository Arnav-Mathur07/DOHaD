const fs = require('fs');

const content = fs.readFileSync('New_Prenatal_Mercury.csv', 'utf-8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = lines[0].split(',').map(h => h.toLowerCase().trim());
const metalIdx = headers.indexOf('metal');
const speciesIdx = headers.indexOf('species');

const metals = {};
const species = {};
let total = 0;

for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            row.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    row.push(current.trim().replace(/^"|"$/g, ''));

    // Fallback logic
    const m = row[metalIdx] || 'Unknown';
    const s = row[speciesIdx] || 'Unknown';
    metals[m] = (metals[m] || 0) + 1;
    species[s] = (species[s] || 0) + 1;
    total++;
}

console.log('Total Records:', total);
console.log('Metals:', JSON.stringify(metals, null, 2));
console.log('Species:', JSON.stringify(species, null, 2));
