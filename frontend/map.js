/* One Leaflet implementation for desktop and mobile. */
window.MapFunctions = {
  currentMap:null, markers:[], polyline:null, request:null, revision:0,
  icon(label, color) { return L.divIcon({className:'route-pin',html:`<span style="background:${color}">${label}</span>`,iconSize:[30,30],iconAnchor:[15,15]}); },
  createStartIcon() { return this.icon('D','#c8263f'); },
  createEndIcon() { return this.icon('A','#e7e7df'); },
  createWaypointIcon() { return this.icon('•','#afbabf'); },
  createMap(id, options={}) {
    this.destroy();
    this.currentMap=L.map(id,{scrollWheelZoom:false}).setView(options.center||[43.2965,5.3698],options.zoom||12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(this.currentMap);
    this.currentMap.on('click',e=>this.addPoint(e.latlng));
    return this.currentMap;
  },
  addPoint(point) {
    if(!this.currentMap || this.markers.length>=100) return;
    const marker=L.marker(point,{draggable:true,icon:this.createWaypointIcon()}).addTo(this.currentMap);
    this.markers.push(marker);
    marker.on('dragend',()=>this.updatePolyline());
    marker.on('contextmenu',()=>{this.currentMap.removeLayer(marker);this.markers=this.markers.filter(m=>m!==marker);this.updatePolyline();});
    this.updatePolyline();
  },
  emit(distance,path,extra={}) { document.dispatchEvent(new CustomEvent('routeUpdated',{detail:{distance,path,pending:false,estimated:false,error:'',...extra}})); },
  async updatePolyline() {
    this.request?.abort();
    const revision=++this.revision, map=this.currentMap;
    if(!map) return;
    if(this.polyline) map.removeLayer(this.polyline);
    const points=this.markers.map(m=>({lat:m.getLatLng().lat,lng:m.getLatLng().lng}));
    this.markers.forEach((m,i)=>m.setIcon(i===0?this.createStartIcon():i===points.length-1?this.createEndIcon():this.icon(String(i),'#afbabf')));
    if(points.length<2) { this.polyline=null; this.emit(0,points); return; }
    this.polyline=L.polyline(points,{color:'#f13d51',weight:4,dashArray:'6 8'}).addTo(map);
    this.emit(0,points,{pending:true});
    const controller=new AbortController(); this.request=controller;
    const timer=setTimeout(()=>controller.abort(),12000);
    try {
      const coords=points.map(p=>`${p.lng},${p.lat}`).join(';');
      const res=await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,{signal:controller.signal});
      const data=await res.json();
      if(!res.ok || data.code!=='Ok' || !data.routes?.length) throw new Error('Tracé routier indisponible');
      if(revision!==this.revision || map!==this.currentMap) return;
      map.removeLayer(this.polyline);
      this.polyline=L.polyline(data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]),{color:'#f13d51',weight:4}).addTo(map);
      this.emit(Number((data.routes[0].distance/1000).toFixed(3)),points);
    } catch {
      if(revision!==this.revision || map!==this.currentMap) return;
      const km=points.slice(1).reduce((sum,p,i)=>sum+window.ChronoTiming.distance(points[i],p),0)/1000;
      this.emit(Number(km.toFixed(3)),points,{estimated:true,error:'Routage indisponible : distance à vol d’oiseau. Vérifiez et corrigez la distance avant de créer le parcours.'});
    } finally { clearTimeout(timer); }
  },
  undo() { const marker=this.markers.pop(); if(marker && this.currentMap) this.currentMap.removeLayer(marker);this.updatePolyline(); },
  clearRoute() { this.request?.abort();this.revision++;if(this.currentMap){this.markers.forEach(m=>this.currentMap.removeLayer(m));if(this.polyline)this.currentMap.removeLayer(this.polyline);}this.markers=[];this.polyline=null;this.emit(0,[]); },
  destroy() { this.request?.abort();this.revision++;if(this.currentMap)this.currentMap.remove();this.currentMap=null;this.markers=[];this.polyline=null; },
  async searchPlace(query) {
    const res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,{signal:AbortSignal.timeout(10000)});
    if(!res.ok) throw new Error('Recherche indisponible. Déplacez la carte manuellement.');
    const results=await res.json();
    if(!results.length) throw new Error('Aucun lieu trouvé. Essayez une ville voisine.');
    this.currentMap?.setView([Number(results[0].lat),Number(results[0].lon)],13);
  }
};
