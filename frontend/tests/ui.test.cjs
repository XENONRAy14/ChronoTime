const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM}=require('jsdom');
const bundle=fs.readFileSync(require('node:path').join(__dirname,'../dist/app.bundle.js'),'utf8');
const flush=()=>new Promise(r=>setTimeout(r,35));
const uid='111111111111111111111111',cid='222222222222222222222222';
async function mount({auth=true,fail=false}={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.scrollTo=()=>{};w.confirm=()=>true;const calls=[];
 if(auth){w.localStorage.setItem('token','test');w.localStorage.setItem('user',JSON.stringify({id:uid,username:'pilote',name:'Pilote'}));}
 w.fetch=async(url,options)=>{calls.push([url,options]);let data;
 if(url.endsWith('/auth/user'))data={_id:uid,username:'pilote',name:'Pilote',isAdmin:false};
 else if(url.endsWith('/courses'))data=[{_id:cid,nom:'Parcours de test',distance:4.2,denivele:0,tracePath:[{lat:43,lng:5},{lat:43.01,lng:5.01}]}];
 else if(url.endsWith('/chronos'))data=[{_id:'333333333333333333333333',courseId:{_id:cid},userId:uid,utilisateur:'Pilote',temps:'0:01:23.450',date:'2026-09-09'}];
 else data={};
 return {ok:!fail,status:fail?503:200,json:async()=>fail?{message:'Base indisponible'}:data};};
 w.eval(bundle);await flush();await flush();return {dom,w,calls};
}
const click=async(w,text)=>{const el=[...w.document.querySelectorAll('button')].find(e=>e.textContent.includes(text));assert.ok(el,`button ${text}`);el.click();await flush();};
test('login form renders locally with associated labels',async()=>{const {dom,w,calls}=await mount({auth:false});assert.match(w.document.body.textContent,/Bienvenue au garage/);assert.ok(w.document.querySelector('label[for="username"]'));assert.equal(calls.length,0);await click(w,'Inscription');assert.ok(w.document.querySelector('#email'));assert.equal(w.document.querySelector('#password').minLength,8);dom.window.close();});
test('garage, leaderboard, stats, GPS and logout work with API fixtures',async()=>{const {dom,w}=await mount();assert.match(w.document.body.textContent,/Chaque virage/);assert.match(w.document.body.textContent,/Parcours de test/);await click(w,'Classements');assert.match(w.document.body.textContent,/0:01:23.450/);await click(w,'Performances');assert.match(w.document.body.textContent,/0:01:23.450/);await click(w,'Session GPS');assert.ok(w.document.querySelector('#session-course'));assert.match(w.document.body.textContent,/0:00:00/);w.document.querySelector('button[aria-label="Se déconnecter"]').click();await flush();assert.match(w.document.body.textContent,/Bienvenue au garage/);dom.window.close();});
test('API failure appears as an error, not a successful empty response',async()=>{const {dom,w}=await mount({fail:true});assert.match(w.document.querySelector('[role="alert"]').textContent,/Base indisponible/);dom.window.close();});
test('course creation is disabled without a trace and accepts three decimal places for distance',async()=>{const {dom,w,calls}=await mount();await click(w,'Nouveau parcours');const inputs=w.document.querySelectorAll('input');assert.ok(inputs.length>=3);const distance=w.document.querySelector('[name="distance"]');assert.equal(distance.step,'0.001');assert.ok(w.document.querySelector('button[type="submit"]').disabled);dom.window.close();});
test('GPS watch ID zero is cleared; failed save remains recoverable and retry updates history',async()=>{
 const {dom,w}=await mount();let callback,cleared=false,clock=0,saves=0;
 Object.defineProperty(w,'isSecureContext',{value:true});Object.defineProperty(w.performance,'now',{value:()=>clock});
 w.navigator.geolocation={watchPosition:fn=>{callback=fn;return 0;},clearWatch:id=>{if(id===0)cleared=true;}};
 const layer=()=>({addTo(){return this;},setLatLng(){return this;},setLatLngs(){return this;},setStyle(){return this;},getBounds(){return [];}});
 w.L={map:()=>({remove(){},fitBounds(){},setView(){return this;}}),tileLayer:layer,polyline:layer,marker:layer,circleMarker:layer,divIcon:()=>({})};
 const oldFetch=w.fetch;w.fetch=async(url,opts)=>{if(url.includes('project-osrm'))return {json:async()=>({})};if(url.endsWith('/chronos')&&opts?.method==='POST'){saves++;return {ok:saves>1,status:saves>1?201:503,json:async()=>saves>1?{_id:'444444444444444444444444',...JSON.parse(opts.body),courseId:{_id:cid},userId:uid,utilisateur:'pilote',date:'2026-09-09'}:{message:'Réseau interrompu'}};}return oldFetch(url,opts);};
 await click(w,'Session GPS');const select=w.document.querySelector('#session-course');select.value=cid;select.dispatchEvent(new w.Event('change',{bubbles:true}));await flush();await click(w,'Armer');
 callback({coords:{latitude:43,longitude:5,accuracy:5,speed:0}});await flush();clock=10000;callback({coords:{latitude:43.01,longitude:5.01,accuracy:5,speed:10}});await flush();
 assert.equal(cleared,true);assert.equal(saves,1);assert.match(w.document.body.textContent,/Chrono à synchroniser/);assert.doesNotMatch(w.document.body.textContent,/Chrono enregistré\./);const stored=JSON.parse(w.localStorage.getItem(`chronotime-pending-${uid}`));assert.ok(stored.clientRequestId);
 await click(w,'Réessayer la sauvegarde');assert.equal(saves,2);assert.equal(w.localStorage.getItem(`chronotime-pending-${uid}`),null);assert.match(w.document.body.textContent,/Chrono enregistré\./);await click(w,'Performances');assert.match(w.document.body.textContent,/0:00:10.000/);dom.window.close();
});
