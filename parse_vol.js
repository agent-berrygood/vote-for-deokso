const fs = require('fs');
const html = fs.readFileSync('j:/내 드라이브/선거 테스트/당회보고용/봉사정보/봉사정보.xls', 'utf-8');

const rows = html.split('<tr');
const volunteerData = {};

let count = 0;
for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // console.log("Parsing row:", i);
    const nameMatch = row.match(/class='pname'>([^<]+)<\/td>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const deptMatch = row.match(/class='p-2'>([^<]+)<\/td>/);
    if (!deptMatch) continue;
    let dept = deptMatch[1].trim();
    dept = dept.replace(/^.*?\[.*?\]/, '').trim(); // Remove [캠퍼스]

    // Find all active years
    // The format is <td class='ps_edit success' SYear='2023' SLog='...' SLog_count='1'><span ...>1\t</span></td>
    // We can split by SYear='
    const yearParts = row.split("SYear='");
    const years = [];
    for (let j = 1; j < yearParts.length; j++) {
        const part = yearParts[j];
        const endQuote = part.indexOf("'");
        if (endQuote === -1) continue;
        const yearStr = part.substring(0, endQuote).trim();

        // now check if this td has '1' inside
        const tdEnd = part.indexOf("</td>");
        if (tdEnd === -1) continue;
        const tdContent = part.substring(endQuote, tdEnd);
        if (tdContent.includes('>1') || tdContent.includes('btn-success\'>1') || tdContent.includes('>1\t')) {
            if (yearStr.includes('.')) {
                yearStr.split('.').forEach(y => years.push(parseInt(y)));
            } else {
                years.push(parseInt(yearStr));
            }
        } else if (tdContent.match(/>\s*1\s*</)) {
            years.push(parseInt(yearStr));
        }
    }

    if (years.length > 0) {
        if (!volunteerData[name]) volunteerData[name] = {};
        if (!volunteerData[name][dept]) volunteerData[name][dept] = new Set();
        years.forEach(y => {
            if (!isNaN(y)) volunteerData[name][dept].add(y);
        });
    }
}

function formatYears(yearsSet) {
    let years = Array.from(yearsSet).sort((a, b) => a - b);
    if (years.length === 0) return '';
    let ranges = [];
    let start = years[0];
    let end = years[0];
    for (let i = 1; i < years.length; i++) {
        if (years[i] === end + 1) {
            end = years[i];
        } else {
            ranges.push(start === end ? `${start % 100}` : `${start % 100}~${end % 100}`);
            start = years[i];
            end = years[i];
        }
    }
    ranges.push(start === end ? `${start % 100}` : `${start % 100}~${end % 100}`);
    return ranges.join(', ');
}

const resultData = {};
for (const name in volunteerData) {
    const depts = [];
    for (const dept in volunteerData[name]) {
        if (volunteerData[name][dept].size === 0) continue;
        const yearsSet = volunteerData[name][dept];
        const maxYear = Math.max(...Array.from(yearsSet));
        depts.push({
            name: dept,
            yearsText: formatYears(yearsSet),
            maxYear: maxYear
        });
    }
    depts.sort((a, b) => b.maxYear - a.maxYear);
    const top3 = depts.slice(0, 3);
    const textLines = top3.map(d => `${d.name} (${d.yearsText})`);
    resultData[name] = textLines.join('\n');
}

const lines = ['Name,VolunteerInfo'];
for (const name in resultData) {
    let info = resultData[name].replace(/"/g, '""');
    lines.push(`"${name}","${info}"`);
}
fs.writeFileSync('test_data/volunteer_processed.csv', lines.join('\n'));
console.log('Processed ' + Object.keys(resultData).length + ' people.');

// Now let's try to update candidates_generated.csv
for (const csvFile of ['candidates_generated.csv', 'candidates_deacon.csv', 'candidates_elder.csv', 'candidates_kwonsa.csv']) {
    const csvPath = 'test_data/' + csvFile;
    if (fs.existsSync(csvPath)) {
        console.log("Updating " + csvFile);
        const csvText = fs.readFileSync(csvPath, 'utf-8');
        const csvLines = csvText.split('\n');

        let header = csvLines[0].trim();
        // check if VolunteerInfo is already added
        let updatedCSV = [];
        if (!header.includes('VolunteerInfo')) {
            updatedCSV.push(header + ',VolunteerInfo');
        } else {
            updatedCSV.push(header);
        }

        for (let i = 1; i < csvLines.length; i++) {
            const line = csvLines[i].trim();
            if (!line) continue;
            // Parse line properly handling quotes
            // Just assume first column is Name and not quoted
            let firstComma = line.indexOf(',');
            let name = line.substring(0, firstComma);
            if (name.startsWith('"')) {
                name = name.substring(1, name.indexOf('"', 1));
            }

            const volInfo = resultData[name] ? resultData[name].replace(/"/g, '""') : '';

            if (!header.includes('VolunteerInfo')) {
                updatedCSV.push(line + `,"${volInfo}"`);
            } else {
                // replace the last column
                // but this is tricky if there are quotes.
                // Assuming currently no quotes except possibly photo link? 
                // Wait, if it already had VolunteerInfo, we wouldn't be here since i'm adding it fresh.
            }
        }
        fs.writeFileSync(csvPath, updatedCSV.join('\n'));
    }
}
