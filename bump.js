const fs = require('fs');
const path = require('path');

// Đọc version hiện tại từ package.json
const pkgPath = path.join(__dirname, 'package.json');
let pkg = { version: '1.0.0' };
if (fs.existsSync(pkgPath)) {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

// Tăng phiên bản (patch version: 1.0.0 -> 1.0.1)
const parts = pkg.version.split('.');
parts[2] = parseInt(parts[2] || 0) + 1;
const newVersion = parts.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log(`Bumping version to ${newVersion}...`);

// Cập nhật tất cả các file HTML
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let updatedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex tìm các thẻ link css và script js nội bộ, thay thế ?v=... bằng version mới
  let changed = false;
  const newContent = content.replace(/(href|src)="([^"]+\.(?:css|js))(?:\?v=[^"]+)?"/g, (match, attr, url) => {
    // Bỏ qua các link CDN hoặc external
    if (url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    changed = true;
    return `${attr}="${url}?v=${newVersion}"`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent);
    updatedCount++;
    console.log(`- Updated ${file}`);
  }
});

console.log(`✅ Đã cập nhật version ${newVersion} cho ${updatedCount} file HTML.`);
