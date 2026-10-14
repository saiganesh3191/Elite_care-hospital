import http from 'node:http';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
const build=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});if(build.status)process.exit(build.status);
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{let file;try{file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');if(!existsSync(file)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(readFileSync(resolve(root,'404.html')));return;}res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(file));});
server.listen(Number(process.env.PORT)||5174,'127.0.0.1',()=>console.log('Elite preview: http://localhost:'+server.address().port));
