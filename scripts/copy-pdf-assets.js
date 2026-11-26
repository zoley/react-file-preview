const fs = require('node:fs');
const path = require('node:path');

for (const folder of ['cmaps', 'standard_fonts']) {
  fs.cpSync(
    path.resolve(__dirname, '../public', folder),
    path.resolve(__dirname, '../lib', folder),
    { recursive: true }
  );
}

console.log('PDF 资源已复制到 lib/cmaps 和 lib/standard_fonts');
