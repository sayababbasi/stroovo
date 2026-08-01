const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'web', 'src'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace: const API_URL = process.env.NEXT_PUBLIC_API_URL || '...';
  // With:    const API_URL = '';
  const regex1 = /const\s+API_URL\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"`].*?['"`]\s*;/g;
  const regex2 = /const\s+API_URL\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\?\?\s*['"`].*?['"`]\s*;/g;
  const regex3 = /const\s+RAW_BASE_URL\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"`].*?['"`]\s*;/g;
  
  let modified = content;
  modified = modified.replace(regex1, "const API_URL = '';");
  modified = modified.replace(regex2, "const API_URL = '';");
  modified = modified.replace(regex3, "const RAW_BASE_URL = '';");
  
  if (modified !== content) {
    fs.writeFileSync(file, modified, 'utf8');
    console.log(`Updated ${file}`);
  }
});
