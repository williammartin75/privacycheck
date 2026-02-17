const fs = require('fs');
let data = fs.readFileSync('src/app/blog/data.ts', 'utf8');

const dateLines = [
    20, 34, 43, 52, 61, 70, 79, 88, 97, 106,
    115, 124, 133, 142, 151, 161, 170, 179, 188, 197,
    206, 215, 224, 233, 242, 251, 260, 269, 278, 287,
    297, 306, 315, 324, 333, 343, 352, 361, 370, 379,
    389, 403, 417, 432, 446, 460, 474, 488,
    502, 516, 530, 544, 558, 572, 586, 600, 614,
    629, 643, 657, 671, 685, 699, 713, 727, 741, 755, 769, 783
];

const startDate = new Date('2026-01-10');
const endDate = new Date('2026-02-17');
const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
const count = dateLines.length;

const lines = data.split(/\r?\n/);

dateLines.forEach((lineNum, i) => {
    const dayOffset = Math.round((i / (count - 1)) * totalDays);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const idx = lineNum - 1;
    lines[idx] = lines[idx].replace(/date: '\d{4}-\d{2}-\d{2}'/, "date: '" + dateStr + "'");
});

fs.writeFileSync('src/app/blog/data.ts', lines.join('\r\n'));
console.log('Done! Staggered ' + dateLines.length + ' dates from 2026-01-10 to 2026-02-17');
