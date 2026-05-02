const fs = require('fs');
const path = require('path');
const filePath = 'd:/Revotic AI Development/Bi/work-platform/public/workflow_illustration.png';
const image = fs.readFileSync(filePath);
const base64 = 'data:image/png;base64,' + image.toString('base64');
fs.writeFileSync('d:/Revotic AI Development/Bi/work-platform/scripts/image-b64.txt', base64);
console.log('Done');
