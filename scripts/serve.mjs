import http from 'node:http';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
const build=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});if(build.status)process.exit(build.status);
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{let file;try{file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');if(!existsSync(file)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(readFileSync(resolve(root,'404.html')));return;}res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(file));});
const requestedPort = process.env.PORT === undefined ? 5174 : Number(process.env.PORT);
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
  console.error('PORT must be an integer between 0 and 65535.');
  process.exit(1);
}
let port = requestedPort;
let attempts = 0;
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && attempts < 20 && port < 65535) {
    console.log(`Port ${port} is in use; trying ${port + 1}...`);
    port += 1;
    attempts += 1;
    server.listen(port, '127.0.0.1');
    return;
  }
  console.error(`Unable to start the preview: ${error.message}`);
  process.exitCode = 1;
});
server.on('listening', () => {
  console.log('Elite preview: http://localhost:' + server.address().port);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
server.listen(port, '127.0.0.1');
