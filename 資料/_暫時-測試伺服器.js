// 暫時的測試伺服器：node 資料/_暫時-測試伺服器.js <要伺服的資料夾> [port]
const h = require('http'), f = require('fs'), p = require('path');
const dir = process.argv[2] || process.cwd();
const port = +process.argv[3] || 4788;
h.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/' || u === '') u = '/第一關.html';
  const base = p.resolve(dir);
  const fp = p.resolve(p.join(dir, u));
  if (!fp.startsWith(base)) { s.statusCode = 403; s.end('forbidden'); return; }
  f.readFile(fp, (e, d) => {
    if (e) { s.statusCode = 404; s.end('not found'); return; }
    s.setHeader('Content-Type', fp.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream');
    s.end(d);
  });
}).listen(port, '127.0.0.1', () => console.log('serving ' + dir + ' at http://127.0.0.1:' + port));
