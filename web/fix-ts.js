const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src/app').filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('description=\"') && content.includes('ResourceHubLayout')) {
    content = content.replace(/description=\"/g, 'subtitle=\"');
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
