// Real MongoDB integration; run explicitly with npm run test:integration.
const {test,before,after}=require('node:test');const assert=require('node:assert/strict');const mongoose=require('mongoose');const {MongoMemoryServer}=require('mongodb-memory-server');
const app=require('../server');const User=require('../models/User');const Chrono=require('../models/Chrono');let mongo,server,base,token,userId,courseId,requestId='test-session-123456789';
before(async()=>{mongo=await MongoMemoryServer.create();await mongoose.connect(mongo.getUri());await Promise.all([User.init(),Chrono.init()]);server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;});
after(async()=>{if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();if(mongo)await mongo.stop();});
async function call(method,url,body,authToken=token){const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(authToken?{Authorization:`Bearer ${authToken}`}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()};}
test('real database: register, login, create, record, retry, permissions, delete',async()=>{
 let r=await call('POST','/api/auth/register',{username:'pilot',name:'Pilot',email:'pilot@example.technology',password:'secure-pass-123'},null);assert.equal(r.status,201);token=r.data.token;userId=r.data.user.id;
 r=await call('POST','/api/auth/login',{username:'pilot',password:'secure-pass-123'},null);assert.equal(r.status,200);assert.ok(r.data.token);token=r.data.token;
 r=await call('GET','/api/auth/user');assert.equal(r.status,200);assert.equal(r.data.password,undefined);
 const course={nom:'Test privé',distance:1.2,denivele:0,tracePath:[{lat:0,lng:0},{lat:0,lng:.01}]};
 r=await call('POST','/api/courses',course);assert.equal(r.status,201);assert.equal(r.data.denivele,0);courseId=r.data._id;
 r=await call('PUT',`/api/courses/${courseId}`,course);assert.equal(r.status,403);
 const payload={courseId,temps:'0:01:30.250',clientRequestId:requestId,stats:{vitesseMax:60,vitesseMoyenne:48}};
 r=await call('POST','/api/chronos',payload);assert.equal(r.status,201);const chronoId=r.data._id;assert.equal(r.data.courseId._id,courseId);assert.equal(r.data.stats.vitesseMax,60);assert.equal(r.data.utilisateur,'pilot');
 r=await call('POST','/api/chronos',payload);assert.equal(r.status,200);assert.equal(r.data._id,chronoId);assert.equal(await Chrono.countDocuments(),1);
 r=await call('POST','/api/chronos',{...payload,clientRequestId:'other-session-123456',temps:'0:99:00'});assert.equal(r.status,400);
 r=await call('POST','/api/chronos',{...payload,clientRequestId:'other-session-123456',courseId:'111111111111111111111111'});assert.equal(r.status,404);
 r=await call('GET','/api/chronos');assert.equal(r.data.length,1);
 await User.findByIdAndUpdate(userId,{isAdmin:true});
 r=await call('DELETE',`/api/courses/${courseId}`);assert.equal(r.status,409);
 r=await call('PATCH',`/api/admin/users/${userId}/demote`);assert.equal(r.status,403);
 r=await call('DELETE',`/api/admin/users/${userId}`);assert.equal(r.status,403);
 r=await call('DELETE',`/api/chronos/${chronoId}`);assert.equal(r.status,200);
 r=await call('DELETE',`/api/courses/${courseId}`);assert.equal(r.status,200);
});
