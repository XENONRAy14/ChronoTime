/* ChronoTime — Trail & Mountain Racing App */

const { useState, useEffect, useCallback, useRef } = React;

// ─── Utility helpers ────────────────────────────────────────
const formatTime = window.ChronoTiming.format;
const timeToSeconds = window.ChronoTiming.seconds;

// ─── SVG Icons (inline, no deps) ───────────────────────────
const IconMountain = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
);
const IconTimer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

// ─── Auth Page ──────────────────────────────────────────────
const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await window.API.login({ username: form.username, password: form.password })
        : await window.API.register(form);
      onAuth(result.user || window.API.getCurrentUser());
    } catch (err) {
      setError(err.message || 'Erreur, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-art"><a className="brand" href="#"><span className="brand-mark">CT/</span><span>CHRONO<span>TIME</span></span></a><div className="auth-art-copy"><div className="eyebrow">TOUGE TIMING SYSTEM <span lang="ja">峠の時間</span></div><h1>CHASE<br/>YOUR <em>BEST.</em></h1><p>La culture touge. La précision GPS.<br/>Un seul adversaire : votre dernier chrono.</p></div><div className="auth-art-footer">CHRONOTIME / VOL. 04 <span>JAPAN SOUL.</span></div></section><div className="auth-panel">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="eyebrow" style={{marginBottom:16}}>DRIVER ACCESS / 01</div>
          <h2>Bienvenue au garage.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vos parcours et performances vous attendent.</p>
        </div>

        <div className="auth-toggle">
          <button className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Connexion</button>
          <button className={`auth-toggle-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Inscription</button>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Pseudo</label>
            <input className="form-input" id="username" name="username" value={form.username} onChange={onChange} required maxLength={40} autoComplete="username" />
          </div>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" type="email" id="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nom complet</label>
                <input className="form-input" id="name" name="name" value={form.name} onChange={onChange} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input className="form-input" type="password" id="password" name="password" value={form.password} onChange={onChange} required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form><p className="fineprint">Usage sur parcours privé autorisé. Votre position est utilisée uniquement pendant une session GPS active.</p>
      </div><div className="auth-bottom">計測 / CHRONOTIME <span>MAKE EVERY SECOND COUNT.</span></div></div>
    </div>
  );
};

// ─── GPS Chrono Tab ─────────────────────────────────────────
const GPSChronoTab = ({ courses, currentUser, onChronoSaved, onSwitchTab, onActiveChange, initialCourseId }) => {
  const [courseId,setCourseId]=useState(initialCourseId||'');
  const [status,setStatus]=useState('idle');
  const [elapsed,setElapsed]=useState(0);
  const [gps,setGps]=useState(null);
  const [error,setError]=useState('');
  const [saveState,setSaveState]=useState('');
  const pendingKey=`chronotime-pending-${currentUser.id||currentUser._id}`;
  const [pending,setPending]=useState(()=>{try{return JSON.parse(localStorage.getItem(pendingKey));}catch{return null;}});
  const watch=useRef(null), timer=useRef(null), session=useRef(null), map=useRef(null), marker=useRef(null), alive=useRef(true), saving=useRef(false);
  const course=courses.find(c=>c.id===courseId);
  const active=status==='waiting'||status==='running';
  const cleanup=()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null;clearInterval(timer.current);};
  useEffect(()=>{onActiveChange(active);return()=>onActiveChange(false);},[active]);
  useEffect(()=>{alive.current=true;const warn=e=>{if(watch.current!==null){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>{alive.current=false;cleanup();window.removeEventListener('beforeunload',warn);map.current?.remove();};},[]);
  useEffect(()=>{
    if(map.current){map.current.remove();map.current=null;marker.current=null;}
    if(!course?.tracePath?.length || typeof L==='undefined')return;
    const m=L.map('gps-map-container',{scrollWheelZoom:false});map.current=m;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(m);
    const path=course.tracePath;
    path.forEach((p,i)=>L.marker([p.lat,p.lng],{icon:window.MapFunctions.icon(i===0?'D':i===path.length-1?'A':String(i),i===0?'#f13d51':'#e9e8e0')}).addTo(m));
    const line=L.polyline(path,{color:'#f13d51',weight:4,dashArray:'6 6'}).addTo(m);m.fitBounds(line.getBounds(),{padding:[35,35]});
    const controller=new AbortController();
    fetch(`https://router.project-osrm.org/route/v1/driving/${path.map(p=>`${p.lng},${p.lat}`).join(';')}?overview=full&geometries=geojson`,{signal:controller.signal}).then(r=>r.json()).then(data=>{if(map.current===m && data.routes?.[0])line.setLatLngs(data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng])).setStyle({dashArray:null});}).catch(()=>{});
    return()=>controller.abort();
  },[courseId,course]);
  const save=async payload=>{
    if(saving.current)return;saving.current=true;setSaveState('saving');
    try {const result=await window.API.createChrono(payload);localStorage.removeItem(pendingKey);if(alive.current){setPending(null);setSaveState('saved');onChronoSaved(result);}}
    catch(e){if(alive.current){setSaveState('error');setError(`Chrono conservé sur cet appareil. ${e.message}`);}}
    finally{saving.current=false;}
  };
  const start=()=>{
    if(!course)return;
    if(!window.isSecureContext){setError('Le GPS nécessite HTTPS ou localhost.');return;}
    if(!navigator.geolocation){setError('Géolocalisation indisponible sur cet appareil.');return;}
    cleanup();setError('');setElapsed(0);setSaveState('');setStatus('waiting');session.current=new window.ChronoTiming.Session(course.tracePath);
    watch.current=navigator.geolocation.watchPosition(pos=>{
      if(!alive.current)return;
      const now=performance.now(), result=session.current.update(pos.coords,now);setGps(result);
      if(!result.valid){setError('Signal GPS trop imprécis : attendez une précision de 35 m ou moins.');return;}
      setError('');
      if(map.current){if(!marker.current)marker.current=L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:7,color:'#fff',fillColor:'#f13d51',fillOpacity:1}).addTo(map.current);else marker.current.setLatLng([pos.coords.latitude,pos.coords.longitude]);}
      setStatus(result.status);
      if(result.status==='running' && !timer.current)timer.current=setInterval(()=>setElapsed(performance.now()-session.current.start),50);
      if(result.status==='finished'){
        cleanup();timer.current=null;setElapsed(result.elapsed);
        const payload={clientRequestId:crypto.randomUUID(),courseId,temps:formatTime(result.elapsed),stats:{vitesseMax:Number(session.current.maxSpeed.toFixed(1)),vitesseMoyenne:Number((course.distance/(result.elapsed/3600000)).toFixed(1))}};
        setPending(payload);
        try{localStorage.setItem(pendingKey,JSON.stringify(payload));}catch{setError('Stockage local indisponible. Gardez cette page ouverte jusqu’à la sauvegarde.');}
        save(payload);
      }
    },e=>{cleanup();timer.current=null;setStatus('idle');setError(({1:'Accès GPS refusé. Autorisez la localisation dans votre navigateur.',2:'Position indisponible. Réessayez à l’extérieur.',3:'Signal GPS introuvable. Réessayez.'})[e.code]||e.message);},{enableHighAccuracy:true,maximumAge:0,timeout:20000});
  };
  const labels={idle:'En attente de session',waiting:'Rejoignez la balise de départ',running:'Session en cours',finished:'Session terminée'};
  return <div className="session-layout">
    <section className="card session-console">
      <div className="eyebrow">LIVE TIMING <span className="jp" lang="ja">計測</span></div>
      <div className="card-header"><h2>Votre prochaine référence.</h2><p>Sélectionnez le parcours. Le GPS s’occupe du chrono.</p></div>
      <label className="form-label" htmlFor="session-course">Parcours</label>
      <select id="session-course" className="form-select" value={courseId} onChange={e=>{setCourseId(e.target.value);setElapsed(0);setGps(null);}} disabled={active||status==='finished'}><option value="">Choisir un parcours</option>{courses.filter(c=>c.tracePath?.length>=2).map(c=><option key={c.id} value={c.id}>{c.nom} · {c.distance} km</option>)}</select>
      <div className={`timing-face ${active?'armed':''}`}><div className="timing-label">TEMPS DE SESSION <span>GPS AUTO</span></div><div className="timer-value">{formatTime(elapsed).slice(0,-4)}<small>.{formatTime(elapsed).slice(-3)}</small></div><div className="rev-strip">{Array.from({length:24},(_,i)=><i key={i}/>)}</div><div className={`status-bar status-${status}`}><span className="status-dot"/>{labels[status]}</div></div>
      <div className="telemetry"><div><strong>{gps?.valid?Math.round(gps.speed):'—'}</strong><span>km/h</span></div><div><strong>{gps?.valid?Math.round(gps.accuracy):'—'}</strong><span>précision · m</span></div><div><strong>{gps?.valid?Math.round(gps.endDistance):'—'}</strong><span>arrivée · m</span></div></div>
      {error && <div className="error-banner" role="alert">{error}</div>}
      {saveState==='saved' && <div className="success-banner" role="status">Chrono enregistré. Retrouvez-le dans vos performances.</div>}
      {pending && <div className="pending-banner"><strong>Chrono à synchroniser · {pending.temps}</strong><button className="btn btn-secondary" disabled={saveState==='saving'} onClick={()=>save(pending)}>{saveState==='saving'?'Enregistrement…':'Réessayer la sauvegarde'}</button></div>}
      {status==='idle' && <button className="btn btn-primary btn-block btn-lg" disabled={!courseId||!!pending} onClick={start}><IconTimer/> Armer le chronomètre <span>↗</span></button>}
      {active && <button className="btn btn-secondary btn-block" onClick={()=>{cleanup();timer.current=null;setStatus('idle');}}>Annuler la session</button>}
      {status==='finished' && !pending && <button className="btn btn-primary btn-block" onClick={()=>{setStatus('idle');setElapsed(0);setGps(null);setSaveState('');}}>Nouvelle session</button>}
      <p className="fineprint">Parcours privé autorisé. Préparez la session à l’arrêt. Les points GPS doivent être franchis dans l’ordre.</p>
    </section>
    <section className="card session-map"><div className="map-heading"><span className="eyebrow">RECONNAISSANCE</span><span>{course?`${course.distance} KM`:'AUCUN PARCOURS'}</span></div>{course?<><div id="gps-map-container" className="map-container"/><div className="map-caption"><span><b>D</b> Départ</span><span>Balise {gps?.next||1} / {course.tracePath.length-1}</span><span><b>A</b> Arrivée</span></div><div className="route-stats"><div className="route-stat"><div className="stat-val">{course.distance} <small>km</small></div><div className="stat-lbl">Distance</div></div><div className="route-stat"><div className="stat-val">{course.denivele} <small>m</small></div><div className="stat-lbl">Dénivelé positif</div></div></div></>:<div className="map-empty"><span className="big-jp" lang="ja">峠</span><h3>Tout commence par un tracé.</h3><p>{courses.length?'Choisissez un parcours pour préparer votre session.':'Créez votre premier parcours avec ses balises de départ et d’arrivée.'}</p><button className="btn btn-secondary" onClick={()=>onSwitchTab('carte')}>Créer un parcours ↗</button></div>}</section>
  </div>;
};

const RouteBuilderTab = ({routeInfo,setRouteInfo,onSwitchTab}) => {
 const [search,setSearch]=useState(''),[error,setError]=useState(''),[searching,setSearching]=useState(false);
 useEffect(()=>{
  const fn=window.MapFunctions;
  const update=e=>{setRouteInfo(prev=>({...prev,...e.detail}));setError(e.detail.error||'');};
  document.addEventListener('routeUpdated',update);
  try{fn.createMap('map-container');if(routeInfo.path.length){routeInfo.path.forEach(p=>fn.addPoint(p));fn.currentMap.fitBounds(L.latLngBounds(routeInfo.path),{padding:[35,35]});}}catch{setError('La carte ne peut pas être chargée. Actualisez la page.');}
  return()=>{document.removeEventListener('routeUpdated',update);fn.destroy();};
 },[]);
 const find=async e=>{e.preventDefault();if(!search.trim()||searching)return;setSearching(true);setError('');try{await window.MapFunctions.searchPlace(search);}catch(e){setError(e.message);}finally{setSearching(false);}};
 return <div className="card"><div className="eyebrow">ROUTE STUDIO <span lang="ja">ルート</span></div><div className="card-header"><h2>Dessinez votre ligne.</h2><p>Cliquez sur la carte : départ, points de passage, puis arrivée. Glissez une balise pour l’ajuster.</p></div><form className="map-search-bar" onSubmit={find}><input aria-label="Rechercher un lieu" className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ville, circuit, lieu…"/><button className="btn btn-secondary" disabled={searching}>{searching?'Recherche…':'Rechercher'}</button></form><div className="map-controls"><button className="btn btn-primary" onClick={()=>{const m=window.MapFunctions.currentMap;if(m)window.MapFunctions.addPoint(m.getCenter());}}>Placer au centre +</button><button className="btn btn-secondary" disabled={!routeInfo.path.length} onClick={()=>window.MapFunctions.undo()}>Annuler le dernier point</button><button className="btn btn-ghost" disabled={!routeInfo.path.length} onClick={()=>window.MapFunctions.clearRoute()}>Tout effacer</button></div>{error&&<div className="error-banner" role="alert">{error}</div>}<div id="map-container" className="map-container builder-map"/><div className="builder-bottom"><div><strong>{routeInfo.pending?'Calcul…':`${routeInfo.distance||0} km`}</strong><span> · {routeInfo.path.length} balises{routeInfo.estimated?' · distance estimée':''}</span></div><button className="btn btn-primary" disabled={routeInfo.path.length<2||routeInfo.pending} onClick={()=>onSwitchTab('course')}>Configurer ce parcours ↗</button></div></div>;
};

// ─── Add Course Tab ─────────────────────────────────────────
const AddCourseTab = ({ routeInfo, setRouteInfo, courses, setCourses, onSwitchTab }) => {
  const [form, setForm] = useState({ nom: '', distance: String(routeInfo.distance || ''), denivele: '' });
  const [saving,setSaving]=useState(false),[error,setError]=useState('');
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);setError('');
    try {
      const data = { nom: form.nom, distance: parseFloat(form.distance), denivele: parseInt(form.denivele), tracePath: routeInfo.path.length > 0 ? routeInfo.path : null };
      const res = await window.API.createCourse(data);
      setCourses(prev => [...prev, { id: res._id, nom: res.nom, distance: res.distance, denivele: res.denivele, tracePath: res.tracePath }]);
      setForm({ nom: '', distance: '', denivele: '' });
      if (window.MapFunctions?.currentMap) window.MapFunctions.clearRoute();
      setRouteInfo({ distance: 0, path: [], searchQuery: '' });
      onSwitchTab(res.tracePath && res.tracePath.length >= 2 ? 'chrono-gps' : 'classement',res._id);
    } catch (err) {
      setError(err.message || 'Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Préparez le parcours.</h2>
        <p>Définissez le tracé dans Route Studio, puis renseignez ses caractéristiques.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="course-nom">Nom de la course</label>
          <input className="form-input" id="course-nom" name="nom" value={form.nom} onChange={onChange} placeholder="Session du col" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="course-distance">Distance (km)</label>
            <input className="form-input" type="number" id="course-distance" name="distance" value={form.distance} onChange={onChange} placeholder="4.2" step="0.001" min="0.001" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="course-denivele">Dénivelé+ (m)</label>
            <input className="form-input" type="number" id="course-denivele" name="denivele" value={form.denivele} onChange={onChange} placeholder="250" min="0" required />
          </div>
        </div>
        {routeInfo.path.length > 0 ? (
          <div className="route-stats" style={{ marginBottom: 16 }}>
            <div className="route-stat"><div className="stat-val">{routeInfo.distance} km</div><div className="stat-lbl">Distance tracé</div></div>
            <div className="route-stat"><div className="stat-val">{routeInfo.path.length}</div><div className="stat-lbl">Points</div></div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>Aucun tracé. Utilisez l'onglet "Tracé" pour dessiner un parcours.</p>
        )}
        <button className="btn btn-primary btn-block" type="submit" disabled={saving || routeInfo.path.length < 2}>{saving ? "Création…" : "Créer le parcours ↗"}</button>{error && <div className="error-banner" role="alert">{error}</div>}
      </form>
    </div>
  );
};

// ─── Leaderboard Tab ────────────────────────────────────────
const LeaderboardTab = ({ courses, chronos }) => {
  const [query,setQuery]=useState('');
  const [bestOnly,setBestOnly]=useState(true);
  const sorted = cid => {const rows=chronos.filter(c=>c.courseId===cid).sort((a,b)=>timeToSeconds(a.temps)-timeToSeconds(b.temps));const seen=new Set();return bestOnly?rows.filter(c=>{const id=c.userId||c.utilisateur;if(seen.has(id))return false;seen.add(id);return true;}):rows;};

  return (
    <div className="card">
      <div className="eyebrow">LEADERBOARD / TIME ATTACK</div><div className="card-header"><h2>La référence à battre.</h2><p>Chronos déclaratifs enregistrés par les pilotes, classés par durée.</p></div><div className="filter-bar"><input className="form-input" aria-label="Filtrer les parcours" placeholder="Rechercher un parcours…" value={query} onChange={e=>setQuery(e.target.value)}/><label className="checkbox-label"><input type="checkbox" checked={bestOnly} onChange={e=>setBestOnly(e.target.checked)}/> Meilleur temps par pilote</label></div>
      {courses.filter(c=>c.nom.toLowerCase().includes(query.toLowerCase())).map(course => {
        const ranked = sorted(course.id);
        return (
          <div key={course.id} className="leaderboard-course">
            <h3>{course.nom}</h3>
            <div className="course-meta">{course.distance} km · D+ {course.denivele}m{course.tracePath && course.tracePath.length > 0 ? ` · ${course.tracePath.length} pts GPS` : ''}</div>
            {ranked.length > 0 ? ranked.map((ch, i) => (
              <div key={ch.id} className={`leaderboard-item ${i < 3 ? `rank-${i + 1}` : ''}`}>
                <div className="leaderboard-rank">{i + 1}</div>
                <div className="leaderboard-name">{ch.utilisateur}</div>
                <div className="leaderboard-date">{ch.date}</div>
                <div className="leaderboard-time">{ch.temps}</div>
              </div>
            )) : <div className="empty-state"><p>Aucun chrono enregistré.</p></div>}
          </div>
        );
      })}
      {!courses.some(c=>c.nom.toLowerCase().includes(query.toLowerCase())) && <div className="empty-state"><p>Aucun parcours ne correspond.</p></div>}
    </div>
  );
};

// ─── My Stats Tab ───────────────────────────────────────────
const MyStatsTab = ({ courses, chronos, currentUser, onSwitchTab }) => {
  const myChronos = chronos.filter(c => c.userId && (c.userId === currentUser._id || c.userId === currentUser.id));

  const sortedForCourse = (cid) => chronos.filter(c => c.courseId === cid).sort((a, b) => timeToSeconds(a.temps) - timeToSeconds(b.temps));

  if (myChronos.length === 0) return (
    <div className="card">
      <div className="card-header"><h2>Mes Statistiques</h2></div>
      <div className="empty-state">
        <p>Aucun chrono enregistré.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lancez votre premier chrono GPS pour voir vos performances ici.</p>
        <button className="btn btn-primary" onClick={() => onSwitchTab('chrono-gps')}>Démarrer un chrono</button>
      </div>
    </div>
  );

  const uniqueCourses = new Set(myChronos.map(c => c.courseId)).size;
  const bestRank = Math.min(...myChronos.map(c => {
    const pos = sortedForCourse(c.courseId).findIndex(x => x.id === c.id);
    return pos >= 0 ? pos + 1 : Infinity;
  }));

  return (
    <div className="card">
      <div className="card-header"><h2>Mes Statistiques</h2></div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{myChronos.length}</div><div className="stat-label">Courses terminées</div></div>
        <div className="stat-card"><div className="stat-value">{uniqueCourses}</div><div className="stat-label">Courses uniques</div></div>
        <div className="stat-card"><div className="stat-value">{bestRank === Infinity ? '—' : bestRank}</div><div className="stat-label">Meilleur classement</div></div>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Mes performances</h3>
      {myChronos.map(ch => {
        const course = courses.find(c => c.id === ch.courseId) || { nom: 'Course inconnue', distance: 0 };
        const pos = sortedForCourse(ch.courseId).findIndex(x => x.id === ch.id) + 1;
        const total = sortedForCourse(ch.courseId).length;
        const secs = timeToSeconds(ch.temps);
        const avgSpd = course.distance > 0 && secs > 0 ? (course.distance / (secs / 3600)).toFixed(1) : '—';

        return (
          <div key={ch.id} className="perf-card">
            <div className="perf-header">
              <h4>{course.nom}</h4>
              <span className="perf-date">{ch.date}</span>
            </div>
            <div className="perf-stats">
              <div className="perf-stat"><div className="val">{ch.temps}</div><div className="lbl">Temps</div></div>
              <div className="perf-stat"><div className="val">{pos}/{total}</div><div className="lbl">Position</div></div>
              <div className="perf-stat"><div className="val">{avgSpd}</div><div className="lbl">km/h moy.</div></div>
              {(ch.stats && (ch.stats.vitesseMaximum || ch.stats.vitesseMax)) && (
                <div className="perf-stat"><div className="val">{parseFloat(ch.stats.vitesseMaximum || ch.stats.vitesseMax || 0).toFixed(1)}</div><div className="lbl">km/h max</div></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Admin Tab ──────────────────────────────────────────────
const AdminTab = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const showMsg = (text, type = 'info') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 4000); };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const u = await window.API.getAllUsers();
      setUsers(u || []);
    } catch { showMsg('Erreur chargement utilisateurs', 'error'); }
    setLoadingUsers(false);
  };

  const loadStats = async () => {
    try {
      const s = await window.API.getAdminStats();
      setStats(s);
    } catch { showMsg('Erreur chargement statistiques', 'error'); }
  };

  useEffect(() => { loadUsers(); loadStats(); }, []);

  const handleAction = async (action, userId, label) => {
    try {
      const fn = { delete: window.API.deleteUser, promote: window.API.promoteUser, demote: window.API.demoteUser }[action];
      const res = await fn(userId);
      if (res && res.success !== false) {
        showMsg(`${label} effectué avec succès`, 'success');
        loadUsers();
        loadStats();
      } else {
        showMsg(res?.message || 'Erreur', 'error');
      }
    } catch (e) { showMsg(e.message || 'Erreur technique', 'error'); }
  };

  return (
    <div className="card">
      <div className="card-header"><h2>Administration</h2><p>Gestion des utilisateurs et statistiques.</p></div>

      {msg && (
        <div className={`admin-message ${msg.type}`}>
          {msg.text}
          <button className="close-btn" onClick={() => setMsg(null)}>×</button>
        </div>
      )}

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-value">{stats.totalUsers || 0}</div><div className="stat-label">Utilisateurs</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalAdmins || 0}</div><div className="stat-label">Admins</div></div>
        </div>
      )}

      <div className="btn-group" style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={loadUsers} disabled={loadingUsers}>{loadingUsers ? 'Chargement…' : 'Actualiser'}</button>
        <button className="btn btn-secondary btn-sm" onClick={loadStats}>Stats</button>
      </div>

      {users.length > 0 ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Nom</th><th>Username</th><th>Rôle</th><th>Inscrit le</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u, i) => {
                const uid = u.id || u._id;
                const isSelf = uid === currentUser.id || uid === currentUser._id;
                return (
                  <tr key={uid || i} className={isSelf ? 'current-user-row' : ''}>
                    <td>{u.name || u.username || '—'}</td>
                    <td>{u.username || '—'}</td>
                    <td><span className={`role-badge ${u.isAdmin ? 'role-admin' : 'role-user'}`}>{u.isAdmin ? 'Admin' : 'Utilisateur'}</span></td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      {!isSelf && (
                        <div className="btn-group">
                          {!u.isAdmin && <button className="btn btn-sm btn-primary" onClick={() => handleAction('promote', uid, 'Promotion')}>Promouvoir</button>}
                          {u.isAdmin && <button className="btn btn-sm btn-secondary" onClick={() => handleAction('demote', uid, 'Rétrogradation')}>Rétrograder</button>}
                          <button className="btn btn-sm btn-danger" onClick={() => { if (confirm(`Supprimer ${u.username} ?`)) handleAction('delete', uid, 'Suppression'); }}>Supprimer</button>
                        </div>
                      )}
                      {isSelf && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vous</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><p>{loadingUsers ? 'Chargement…' : 'Aucun utilisateur.'}</p></div>
      )}
    </div>
  );
};

// ─── CGU Tab ────────────────────────────────────────────────
const CGUTab = () => (
  <div className="card">
    <div className="card-header"><h2>Conditions Générales d'Utilisation</h2></div>
    <div className="cgu-section"><h3>1. Objet</h3><p>ChronoTime permet de chronométrer des sessions GPS sur parcours privé autorisé et de comparer ses performances.</p></div>
    <div className="cgu-section"><h3>2. Responsabilité</h3><p>Le développeur décline toute responsabilité en cas d'accidents, blessures ou dommages. L'utilisation sur voie publique est interdite.</p></div>
    <div className="cgu-section"><h3>3. GPS</h3><p>La géolocalisation peut être imprécise. Ne vous fiez jamais uniquement au GPS. Vérifiez visuellement votre environnement.</p></div>
    <div className="cgu-section"><h3>4. Données personnelles</h3>
      <ul><li>Géolocalisation pour le chronométrage</li><li>Informations de compte (nom, email)</li><li>Aucune vente à des tiers</li><li>Stockage sécurisé</li></ul>
    </div>
    <div className="cgu-section"><h3>5. Conditions d'usage</h3>
      <ul><li>Usage exclusif sur terrain privé avec autorisation</li><li>Équipements de sécurité obligatoires</li><li>Respect des réglementations locales</li></ul>
    </div>
    <div className="cgu-warning">
      <h3>Avertissement</h3>
      <p>Application destinée exclusivement à un usage privé sur terrain privé. Toute utilisation sur voie publique est interdite.</p>
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 16 }}>Version des conditions : 9 septembre 2026 · v4.0</p>
  </div>
);

// ─── Main App ───────────────────────────────────────────────
const normalizeChrono=ch=>({...ch,id:ch._id||ch.id,courseId:ch.courseId?._id||ch.courseId,userId:ch.userId?._id||ch.userId,date:ch.date?new Date(ch.date).toLocaleDateString('fr-FR'):''});
const Dashboard = ({courses,chronos,user,onSwitchTab}) => {
 const mine=chronos.filter(c=>c.userId===(user.id||user._id));
 return <>
 <section className="garage-hero"><div className="hero-content"><div className="eyebrow">CHRONOTIME / TOUGE CLUB <span lang="ja">峠の時間</span></div><h1>Chaque virage.<br/>Chaque <em>seconde.</em></h1><p>Votre ligne. Vos chronos. Votre progression.</p><button className="btn btn-primary btn-lg" onClick={()=>onSwitchTab('chrono-gps')}>Préparer une session <span>↗</span></button></div><div className="hero-stamp"><span lang="ja">走り屋</span><small>PRIVATE COURSE ONLY</small></div><div className="hero-bottom"><span>01 / THE NIGHT RUN</span><span>PRECISION OVER EGO</span></div></section>
 <div className="overview-stats"><div><span>PARCOURS DISPONIBLES</span><strong>{String(courses.length).padStart(2,'0')}</strong><small>À explorer</small></div><div><span>MES SESSIONS</span><strong>{String(mine.length).padStart(2,'0')}</strong><small>Chronos enregistrés</small></div><div><span>DISTANCE CUMULÉE</span><strong>{mine.reduce((n,c)=>n+(Number(courses.find(x=>x.id===c.courseId)?.distance)||0),0).toFixed(1)}<small> km</small></strong><small>Sur vos sessions terminées</small></div></div>
 <div className="dashboard-bottom"><section className="card"><div className="section-heading"><div><div className="eyebrow">VOTRE TERRAIN DE JEU</div><h2>Les parcours</h2></div><button className="btn btn-ghost" onClick={()=>onSwitchTab('carte')}>Créer +</button></div>{courses.length?courses.slice(0,4).map((c,i)=><button className="route-row" key={c.id} onClick={()=>onSwitchTab('chrono-gps',c.id)}><span className="route-index">{String(i+1).padStart(2,'0')}</span><span><strong>{c.nom}</strong><small>{c.distance} km · D+ {c.denivele} m</small></span><span className="route-arrow">↗</span></button>):<div className="empty-state"><h3>La première ligne est à vous.</h3><p>Placez vos balises sur la carte pour créer un parcours.</p><button className="btn btn-secondary" onClick={()=>onSwitchTab('carte')}>Ouvrir Route Studio ↗</button></div>}</section><section className="card recent-card"><div className="eyebrow">JOURNAL DE BORD</div><h2>Dernières sessions</h2>{mine.length?mine.slice(0,4).map(c=><div className="recent-row" key={c.id}><div><strong>{courses.find(x=>x.id===c.courseId)?.nom||'Parcours supprimé'}</strong><small>{c.date}</small></div><b>{c.temps}</b></div>):<div className="empty-state"><IconTimer/><p>Votre histoire commence<br/>au prochain départ.</p></div>}<button className="btn btn-ghost btn-block" onClick={()=>onSwitchTab('statistiques')}>Mes performances ↗</button></section></div>
 </>;
};
const App = () => {
 const [user,setUser]=useState(window.API.getCurrentUser());
 const [tab,setTab]=useState('garage');
 const [initialCourseId,setInitialCourseId]=useState('');
 const [courses,setCourses]=useState([]),[chronos,setChronos]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[active,setActive]=useState(false);
 const [routeInfo,setRouteInfo]=useState({distance:0,path:[],searchQuery:''});
 const isAuth=!!user&&window.API.isAuthenticated();
 const loadData=useCallback(async()=>{setLoading(true);setError('');try{const [cs,ts]=await Promise.all([window.API.getCourses(),window.API.getChronos()]);setCourses(cs.map(c=>({...c,id:c._id||c.id})));setChronos(ts.map(normalizeChrono));}catch(e){setError(e.message);}finally{setLoading(false);}},[]);
 const handleLogout=()=>{if(active&&!confirm('Arrêter le suivi GPS et se déconnecter ?'))return;window.API.logout();setUser(null);setCourses([]);setChronos([]);setRouteInfo({distance:0,path:[],searchQuery:''});setActive(false);};
 useEffect(()=>{const expired=()=>{setUser(null);setActive(false);};window.addEventListener('auth-expired',expired);return()=>window.removeEventListener('auth-expired',expired);},[]);
 useEffect(()=>{if(isAuth){loadData();window.API.getUser().then(u=>{setUser(u);localStorage.setItem('user',JSON.stringify(u));}).catch(()=>{});}},[isAuth]);
 const switchTab=(id,courseId)=>{if(courseId)setInitialCourseId(courseId);if(id===tab)return;if(active&&!confirm('Quitter cette session arrêtera le suivi GPS. Continuer ?'))return;setTab(id);setActive(false);window.scrollTo({top:0,behavior:'instant'});};
 if(!isAuth)return <AuthPage onAuth={u=>{setUser(u);setTab('garage');}}/>;
 const tabs=[{id:'garage',label:'Le garage',icon:'01'},{id:'chrono-gps',label:'Session GPS',icon:'02'},{id:'carte',label:'Route Studio',icon:'03'},{id:'course',label:'Nouveau parcours',icon:'04'},{id:'classement',label:'Classements',icon:'05'},{id:'statistiques',label:'Performances',icon:'06'},...(user.isAdmin?[{id:'admin',label:'Administration',icon:'07'}]:[])];
 return <div className="app-shell"><a className="skip-link" href="#main">Aller au contenu</a><aside className="sidebar"><button className="brand" onClick={()=>switchTab('garage')}><span className="brand-mark">CT<span>/</span></span><span>CHRONO<span>TIME</span><small>TOUGE TIMING SYSTEM</small></span></button><div className="sidebar-label">DRIVER WORKSPACE</div><nav aria-label="Navigation principale">{tabs.map(t=><button key={t.id} className={`side-link ${tab===t.id?'active':''}`} aria-current={tab===t.id?'page':undefined} onClick={()=>switchTab(t.id)}><span>{t.icon}</span>{t.label}{tab===t.id&&<b>↗</b>}</button>)}</nav><div className="sidebar-bottom"><div className="club-label" lang="ja">峠 <span>THE TOUGE CLUB</span></div><button className="side-link" onClick={()=>switchTab('cgu')}>Conditions d’utilisation</button><button className="driver-profile" onClick={handleLogout} title="Se déconnecter"><span className="avatar">{(user.name||user.username||'?').slice(0,2).toUpperCase()}</span><span><strong>{user.username}</strong><small>Déconnexion</small></span><IconLogout/></button></div></aside><div className="workspace"><header className="topbar"><div><span className="breadcrumb">WORKSPACE / </span><strong>{tabs.find(t=>t.id===tab)?.label||'Conditions'}</strong></div><div className="topbar-right"><span className="version-tag">CT / 04</span><button className="btn btn-ghost btn-sm" aria-label="Se déconnecter" onClick={handleLogout}><IconLogout/></button><button className="btn btn-ghost btn-sm" disabled={loading||active} onClick={loadData}>{loading?'Chargement…':'Actualiser ↻'}</button></div></header><main id="main" className="main-content"><div className="page-intro"><span className="eyebrow">{new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span><span className="eyebrow">JAPAN SOUL. PERSONAL BEST.</span></div>{error&&<div className="error-banner" role="alert">{error} <button className="btn btn-secondary btn-sm" onClick={loadData}>Réessayer</button></div>}{loading&&<div className="loading-bar" role="status"><span className="spinner"/>Synchronisation des parcours et chronos…</div>}
 {tab==='garage'&&<Dashboard courses={courses} chronos={chronos} user={user} onSwitchTab={switchTab}/>}
 {tab==='chrono-gps'&&<GPSChronoTab courses={courses} currentUser={user} onChronoSaved={ch=>setChronos(prev=>[normalizeChrono(ch),...prev.filter(x=>x.id!==ch._id)])} onSwitchTab={switchTab} onActiveChange={setActive} initialCourseId={initialCourseId}/>}
 {tab==='carte'&&<RouteBuilderTab routeInfo={routeInfo} setRouteInfo={setRouteInfo} onSwitchTab={switchTab}/>}
 {tab==='course'&&<AddCourseTab routeInfo={routeInfo} setRouteInfo={setRouteInfo} courses={courses} setCourses={setCourses} onSwitchTab={switchTab}/>}
 {tab==='classement'&&<LeaderboardTab courses={courses} chronos={chronos}/>}
 {tab==='statistiques'&&<MyStatsTab courses={courses} chronos={chronos} currentUser={user} onSwitchTab={switchTab}/>}
 {tab==='admin'&&user.isAdmin&&<AdminTab currentUser={user}/>}
 {tab==='cgu'&&<CGUTab/>}
 </main><footer className="app-footer"><span>CHRONOTIME <b>/</b> TOUGE TIMING SYSTEM</span><span>Sur parcours privé autorisé · v4.0</span></footer></div></div>;
};
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
