const fs=require('node:fs');const path=require('node:path');const esbuild=require('esbuild');
async function build(){
 const dist=path.join(__dirname,'dist');fs.mkdirSync(dist,{recursive:true});
 await esbuild.build({entryPoints:[path.join(__dirname,'entry.js')],bundle:true,minify:true,loader:{'.js':'jsx'},outfile:path.join(dist,'app.bundle.js'),define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
 for(const file of ['index.html','theme.css','manifest.json','runtime-config.js','sw.js'])fs.copyFileSync(path.join(__dirname,file),path.join(dist,file));
 for(const dir of ['assets','icons'])fs.cpSync(path.join(__dirname,dir),path.join(dist,dir),{recursive:true});
 fs.mkdirSync(path.join(dist,'vendor'),{recursive:true});
 fs.copyFileSync(require.resolve('leaflet/dist/leaflet.css'),path.join(dist,'vendor/leaflet.css'));
 fs.cpSync(path.dirname(require.resolve('leaflet/dist/leaflet.css'))+'/images',path.join(dist,'vendor/images'),{recursive:true});
 console.log('ChronoTime frontend built → frontend/dist');
}
build().catch(e=>{console.error(e);process.exit(1);});
