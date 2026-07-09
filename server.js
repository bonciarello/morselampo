const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4600;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Remove query string, strip leading slash for safe join
  const urlPath = req.url.split('?')[0];
  const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');

  // Resolve safely
  const fullPath = path.resolve(ROOT, relPath);

  // Security: must be inside ROOT
  if (!fullPath.startsWith(ROOT + path.sep) && fullPath !== path.join(ROOT, 'index.html')) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(fullPath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('MorseLampo → http://localhost:' + PORT);
  console.log('PID: ' + process.pid);
});
