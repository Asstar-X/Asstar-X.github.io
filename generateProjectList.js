const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'projects');
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.md'));

fs.writeFileSync(path.join(dir, 'list.json'), JSON.stringify(files, null, 2), 'utf-8');
console.log('项目文件列表已生成: projects/list.json'); 