const fs=require('node:fs'),crypto=require('node:crypto');
fs.mkdirSync('dist',{recursive:true});
let html=fs.readFileSync('index.html','utf8');
for(const name of ['style.css','game.js']){
 const bytes=fs.readFileSync(name),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
 const output=name.replace(/(\.[^.]+)$/,'.'+hash+'$1');
 fs.copyFileSync(name,'dist/'+output);
 html=html.replace(name,output);
}
fs.writeFileSync('dist/index.html',html);
fs.writeFileSync('dist/_headers','/*\n  Cache-Control: no-cache\n');
console.log('Release files prepared in dist.');
