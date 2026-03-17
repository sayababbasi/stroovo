const fs = require('fs');
fs.writeFileSync('e:/Business/Development/Bi/work-platform/backend/.env', beContent);
fs.writeFileSync('e:/Business/Development/Bi/work-platform/.env', rootContent);
console.log('ENV_FILES_WRITTEN_V2');
