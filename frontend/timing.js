/* Deterministic timing core, independent from React and Leaflet. */
(function (root) {
  const distance = (a, b) => {
    if (![a?.lat,a?.lng,b?.lat,b?.lng].every(Number.isFinite)) return null;
    const rad = Math.PI / 180, dLat = (b.lat-a.lat)*rad, dLng = (b.lng-a.lng)*rad;
    const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0,1-h)));
  };
  const format = ms => {
    const n = Math.max(0, Math.floor(ms || 0));
    return `${Math.floor(n/3600000)}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')}.${String(n%1000).padStart(3,'0')}`;
  };
  const seconds = text => typeof text === 'string' && /^\d+:[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/.test(text) ? text.split(':').reduce((v,n)=>v*60+Number(n),0) : Infinity;
  class Session {
    constructor(path) { this.path=path; this.status='waiting'; this.next=1; this.start=null; this.last=null; this.maxSpeed=0; this.splits=[]; this.leftStart=false; }
    update(pos, now) {
      const p={lat:pos.latitude,lng:pos.longitude};
      if (!Number.isFinite(pos.accuracy) || pos.accuracy>35 || distance(p,p)===null) return {valid:false,status:this.status};
      const startDistance=distance(p,this.path[0]), endDistance=distance(p,this.path.at(-1));
      const radius=25;
      if(this.status==='waiting' && startDistance<=radius) { this.status='running'; this.start=now; }
      else if(this.status==='running') {
        if(startDistance>radius*2) this.leftStart=true;
        if(this.leftStart && this.next<this.path.length && distance(p,this.path[this.next])<=radius) {
          this.splits.push({index:this.next,elapsed:now-this.start}); this.next++;
          if(this.next===this.path.length && now-this.start>=1000) this.status='finished';
        }
      }
      let speed=Number.isFinite(pos.speed) && pos.speed>=0 ? pos.speed*3.6 : 0;
      if(!speed && this.last && now>this.last.now) speed=distance(p,this.last.p)/(now-this.last.now)*3600;
      speed = Math.min(350, Math.max(0,speed));
      if(this.status==='running') this.maxSpeed=Math.max(this.maxSpeed,speed);
      this.last={p,now};
      return {valid:true,status:this.status,startDistance,endDistance,accuracy:pos.accuracy,speed,elapsed:this.start===null?0:now-this.start,next:this.next,splits:this.splits};
    }
  }
  const api={distance,format,seconds,Session};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.ChronoTiming=api;
})(typeof window!=='undefined'?window:globalThis);
