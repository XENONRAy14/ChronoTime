/* ChronoTime — Trail & Mountain Racing App */

const { useState, useEffect, useCallback, useRef } = React;

// ─── Utility helpers ────────────────────────────────────────
const formatTime = (ms) => {
  if (!ms) return "0:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const timeToSeconds = (t) => {
  const parts = t.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
};

const calcDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2 || typeof L === 'undefined') return null;
  try { return L.latLng(lat1, lon1).distanceTo(L.latLng(lat2, lon2)); } catch { return null; }
};

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
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: 'var(--primary-color)', marginBottom: 8 }}><IconMountain /></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>ChronoTime</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chronométrage GPS pour trail & montagne</p>
        </div>

        <div className="auth-toggle">
          <button className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Connexion</button>
          <button className={`auth-toggle-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Inscription</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <input className="form-input" name="username" value={form.username} onChange={onChange} required autoComplete="username" />
          </div>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input className="form-input" name="name" value={form.name} onChange={onChange} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={onChange} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── GPS Chrono Tab ─────────────────────────────────────────
const GPSChronoTab = ({ courses, currentUser, onChronoSaved }) => {
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [gpsInfo, setGpsInfo] = useState({ distStart: null, distEnd: null });
  const [sectors, setSectors] = useState([]);
  const watchRef = useRef(null);
  const startRef = useRef(null);
  const timerRef = useRef(null);
  const stateRef = useRef({ status: 'idle', lastPos: null, lastTime: null, maxSpeed: 0, curSpeed: 0 });

  const gpsCourses = courses.filter(c => c.tracePath && c.tracePath.length >= 2);
  const selectedCourse = courses.find(c => c.id === courseId);

  // Generate sectors on course change
  useEffect(() => {
    if (!selectedCourse || !selectedCourse.tracePath) { setSectors([]); return; }
    if (window.SectorDetection) {
      try {
        const s = window.SectorDetection.generateSectorsForCourse(selectedCourse);
        selectedCourse.sectors = s;
        setSectors(s);
      } catch { setSectors([]); }
    }
  }, [courseId]);

  // Display trace on map
  useEffect(() => {
    if (!selectedCourse || !selectedCourse.tracePath || selectedCourse.tracePath.length < 2) return;
    const show = () => {
      if (!window.MapFunctions || !window.MapFunctions.currentMap) {
        const el = document.getElementById('gps-map-container');
        if (el && window.MapFunctions) {
          try { window.MapFunctions.createMap('gps-map-container'); } catch {}
        }
        if (!window.MapFunctions || !window.MapFunctions.currentMap) return false;
      }
      try {
        if (window.MapFunctions.clearRoute) window.MapFunctions.clearRoute();
        const tp = selectedCourse.tracePath;
        const start = tp[0], end = tp[tp.length - 1];
        const addMarker = (pt, icon, label) => {
          const m = L.marker([pt.lat, pt.lng], { draggable: false, icon }).addTo(window.MapFunctions.currentMap);
          m.bindPopup(label);
          window.MapFunctions.markers.push(m);
        };
        try {
          addMarker(start, window.MapFunctions.createStartIcon(), 'Départ');
          addMarker(end, window.MapFunctions.createEndIcon(), 'Arrivée');
          for (let i = 1; i < tp.length - 1; i++) addMarker(tp[i], window.MapFunctions.createWaypointIcon(), `Point ${i}`);
        } catch {
          addMarker(start, new L.Icon.Default(), 'Départ');
          addMarker(end, new L.Icon.Default(), 'Arrivée');
        }
        window.MapFunctions.updatePolyline();
      } catch {}
      return true;
    };
    let attempts = 0;
    const tryShow = () => { if (!show() && attempts++ < 8) setTimeout(tryShow, 300); };
    setTimeout(tryShow, 200);
  }, [courseId]);

  const startTracking = () => {
    if (!navigator.geolocation) { setError("Géolocalisation non supportée par votre navigateur."); return; }
    if (!courseId) { setError("Sélectionnez une course."); return; }
    if (!selectedCourse || !selectedCourse.tracePath || selectedCourse.tracePath.length < 2) { setError("Cette course n'a pas de tracé défini."); return; }

    const startPt = selectedCourse.tracePath[0];
    const endPt = selectedCourse.tracePath[selectedCourse.tracePath.length - 1];
    setStatus('waiting'); setError(null); setElapsed(0);
    stateRef.current = { status: 'waiting', lastPos: null, lastTime: null, maxSpeed: 0, curSpeed: 0 };

    const gps = (window.GPSTestMode && window.GPSTestMode.isActive) ? window.GPSTestMode : navigator.geolocation;
    const wid = gps.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const dStart = calcDistance(lat, lng, startPt.lat, startPt.lng);
        const dEnd = calcDistance(lat, lng, endPt.lat, endPt.lng);
        const acc = pos.coords.accuracy || 100;
        const thresh = Math.min(Math.max(acc * 2, 50), 300);
        const nearStart = dStart !== null && dStart < thresh;
        const nearEnd = dEnd !== null && dEnd < thresh;

        setGpsInfo({ distStart: dStart, distEnd: dEnd });

        // Update position marker on map
        if (window.MapFunctions && window.MapFunctions.currentMap) {
          if (window._ctUserMarker) window.MapFunctions.currentMap.removeLayer(window._ctUserMarker);
          window._ctUserMarker = L.marker([lat, lng], {
            icon: L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5)"></div>', iconSize: [14, 14], iconAnchor: [7, 7] })
          }).addTo(window.MapFunctions.currentMap);
          window.MapFunctions.currentMap.setView([lat, lng], 15);
        }

        const st = stateRef.current;
        if (st.status === 'waiting' && nearStart) {
          st.status = 'running';
          startRef.current = Date.now();
          setStatus('running');
          timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 200);
        }

        if (st.status === 'running' && nearEnd) {
          st.status = 'finished';
          const fin = Date.now() - startRef.current;
          clearInterval(timerRef.current);
          setElapsed(fin);
          setStatus('finished');
          navigator.geolocation.clearWatch(wid);
          watchRef.current = null;

          const temps = formatTime(fin);
          const distKm = selectedCourse.distance || 0;
          const timeH = fin / 3600000;
          const avgSpeed = timeH > 0 ? (distKm / timeH).toFixed(1) : '0';

          const chrono = {
            utilisateur: currentUser.username || currentUser.name || '',
            courseId,
            temps,
            date: new Date().toISOString().split('T')[0],
            stats: { vitesseMoyenne: avgSpeed, vitesseMaximum: st.maxSpeed.toFixed(1) }
          };
          window.API.createChrono(chrono).then(r => { if (onChronoSaved) onChronoSaved(r); }).catch(() => { if (onChronoSaved) onChronoSaved({ ...chrono, _id: `local-${Date.now()}` }); });
        }

        // Speed calc
        if (st.status === 'running' && st.lastPos && st.lastTime) {
          const d = calcDistance(lat, lng, st.lastPos.lat, st.lastPos.lng);
          const dt = Date.now() - st.lastTime;
          if (d && d > 2 && dt > 0) {
            const spd = (d / 1000) / (dt / 3600000);
            if (spd > 0 && spd < 250) {
              st.curSpeed = st.curSpeed ? st.curSpeed * 0.7 + spd * 0.3 : spd;
              if (st.curSpeed > st.maxSpeed) st.maxSpeed = st.curSpeed;
            }
          }
        }
        st.lastPos = { lat, lng }; st.lastTime = Date.now();
      },
      (err) => {
        const msgs = { 1: 'Permission refusée.', 2: 'Position indisponible.', 3: 'Timeout GPS.' };
        setError(msgs[err.code] || err.message);
        setStatus('idle');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
    watchRef.current = wid;
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    clearInterval(timerRef.current);
    setStatus('idle');
    stateRef.current.status = 'idle';
  };

  const resetChrono = () => {
    setCourseId(''); setStatus('idle'); setElapsed(0); setError(null);
    setGpsInfo({ distStart: null, distEnd: null });
    stateRef.current = { status: 'idle', lastPos: null, lastTime: null, maxSpeed: 0, curSpeed: 0 };
  };

  const statusLabels = { idle: 'Prêt', waiting: 'En attente du départ…', running: 'Course en cours', finished: 'Terminée !' };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Chronomètre GPS</h2>
        <p>Le chrono démarre et s'arrête automatiquement au passage des balises GPS.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label className="form-label">Course</label>
        <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)} disabled={status !== 'idle'}>
          <option value="">Sélectionnez une course…</option>
          {gpsCourses.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.distance} km, D+ {c.denivele}m</option>)}
        </select>
      </div>

      <div id="gps-map-container" className="map-container"></div>

      {sectors.length > 0 && (
        <div className="sectors-list">
          {sectors.map(s => (
            <div key={s.id} className="sector-chip">
              <div className="sector-name">Secteur {s.id}</div>
              <div className="sector-desc">{s.name}</div>
              {s.difficulty && <span className={`difficulty-tag difficulty-${s.difficulty}`}>{s.difficulty}</span>}
            </div>
          ))}
        </div>
      )}

      <div className={`status-bar status-${status}`}>
        <span className="status-dot"></span>
        {statusLabels[status]}
      </div>

      {(status === 'waiting' || status === 'running') && (
        <div className="gps-badges">
          {gpsInfo.distStart !== null && <div className="gps-badge"><div className="badge-value">{Math.round(gpsInfo.distStart)} m</div><div className="badge-label">Dist. départ</div></div>}
          {gpsInfo.distEnd !== null && <div className="gps-badge"><div className="badge-value">{Math.round(gpsInfo.distEnd)} m</div><div className="badge-label">Dist. arrivée</div></div>}
        </div>
      )}

      {status === 'running' && (
        <div className="chrono-timer">
          <div className="timer-value">{formatTime(elapsed)}</div>
          <div className="timer-label">Temps écoulé</div>
        </div>
      )}

      {status === 'finished' && (
        <div className="chrono-result">
          <div className="result-label">Votre temps</div>
          <div className="result-value">{formatTime(elapsed)}</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9rem' }}>Chrono enregistré avec succès !</p>
        </div>
      )}

      <div className="btn-group" style={{ marginTop: 16 }}>
        {status === 'idle' && <button className="btn btn-primary btn-lg btn-block" onClick={startTracking} disabled={!courseId}>Démarrer le suivi GPS</button>}
        {(status === 'waiting' || status === 'running') && <button className="btn btn-secondary btn-block" onClick={stopTracking}>Annuler</button>}
        {status === 'finished' && <button className="btn btn-primary btn-block" onClick={resetChrono}>Nouveau chrono</button>}
      </div>
    </div>
  );
};

// ─── Route Builder Tab ──────────────────────────────────────
const RouteBuilderTab = ({ routeInfo, setRouteInfo, onSwitchTab }) => {
  useEffect(() => {
    if (!window.MapFunctions) return;
    const el = document.getElementById('map-container');
    if (!el) return;
    if (window.MapFunctions.currentMap) { try { window.MapFunctions.currentMap.remove(); } catch {} window.MapFunctions.currentMap = null; }
    el.innerHTML = '';
    try { window.MapFunctions.createMap('map-container'); } catch {}

    const handler = (e) => {
      setRouteInfo(prev => ({ ...prev, distance: e.detail.distance, path: e.detail.path }));
    };
    document.addEventListener('routeUpdated', handler);
    return () => document.removeEventListener('routeUpdated', handler);
  }, []);

  const addMarker = (type) => {
    if (!window.MapFunctions || !window.MapFunctions.currentMap) return;
    const center = window.MapFunctions.currentMap.getCenter();
    let icon;
    try {
      icon = type === 'start' ? window.MapFunctions.createStartIcon() : type === 'end' ? window.MapFunctions.createEndIcon() : window.MapFunctions.createWaypointIcon();
    } catch { icon = new L.Icon.Default(); }
    const m = L.marker([center.lat, center.lng], { draggable: true, icon }).addTo(window.MapFunctions.currentMap);
    m.bindPopup(type === 'start' ? 'Départ' : type === 'end' ? 'Arrivée' : 'Point intermédiaire');
    window.MapFunctions.markers.push(m);
    m.on('dragend', () => window.MapFunctions.updatePolyline());
    window.MapFunctions.updatePolyline();
  };

  const [search, setSearch] = useState('');
  const handleSearch = () => {
    if (window.MapFunctions && search) window.MapFunctions.searchPlace(search, () => setSearch(''));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Définir un tracé</h2>
        <p>Placez des marqueurs pour créer le parcours. Glissez-les pour ajuster.</p>
      </div>

      <div className="map-search-bar">
        <input className="form-input" placeholder="Rechercher un lieu…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-secondary" onClick={handleSearch}>Rechercher</button>
      </div>

      <div className="map-controls">
        <button className="btn btn-primary btn-sm" onClick={() => addMarker('start')}>+ Départ</button>
        <button className="btn btn-secondary btn-sm" onClick={() => addMarker('waypoint')}>+ Point intermédiaire</button>
        <button className="btn btn-primary btn-sm" onClick={() => addMarker('end')}>+ Arrivée</button>
        <button className="btn btn-danger btn-sm" onClick={() => window.MapFunctions && window.MapFunctions.clearRoute()}>Effacer</button>
      </div>

      <div id="map-container" className="map-container"></div>

      {routeInfo.path.length > 0 && (
        <>
          <div className="route-stats">
            <div className="route-stat"><div className="stat-val">{routeInfo.distance} km</div><div className="stat-lbl">Distance</div></div>
            <div className="route-stat"><div className="stat-val">{routeInfo.path.length}</div><div className="stat-lbl">Points</div></div>
          </div>
          <button className="btn btn-accent btn-block" style={{ marginTop: 14 }} onClick={() => onSwitchTab('course')}>Utiliser ce tracé →</button>
        </>
      )}
    </div>
  );
};

// ─── Add Course Tab ─────────────────────────────────────────
const AddCourseTab = ({ routeInfo, setRouteInfo, courses, setCourses, onSwitchTab }) => {
  const [form, setForm] = useState({ nom: '', distance: '', denivele: '' });
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.distance || !form.denivele) return;
    try {
      const data = { nom: form.nom, distance: parseFloat(form.distance), denivele: parseInt(form.denivele), tracePath: routeInfo.path.length > 0 ? routeInfo.path : null };
      const res = await window.API.createCourse(data);
      setCourses(prev => [...prev, { id: res._id, nom: res.nom, distance: res.distance, denivele: res.denivele, tracePath: res.tracePath }]);
      setForm({ nom: '', distance: '', denivele: '' });
      if (window.MapFunctions) window.MapFunctions.clearRoute();
      setRouteInfo({ distance: 0, path: [], searchQuery: '' });
      onSwitchTab(res.tracePath && res.tracePath.length >= 2 ? 'chrono-gps' : 'classement');
    } catch (err) {
      alert('Erreur: ' + (err.message || 'Veuillez réessayer.'));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Ajouter une course</h2>
        <p>Définissez d'abord le tracé dans l'onglet "Tracé", puis complétez ici.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nom de la course</label>
          <input className="form-input" name="nom" value={form.nom} onChange={onChange} placeholder="Trail du Mont Blanc" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Distance (km)</label>
            <input className="form-input" type="number" name="distance" value={form.distance || routeInfo.distance || ''} onChange={onChange} placeholder="42" step="0.1" min="0" required />
          </div>
          <div className="form-group">
            <label className="form-label">Dénivelé+ (m)</label>
            <input className="form-input" type="number" name="denivele" value={form.denivele} onChange={onChange} placeholder="2500" min="0" required />
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
        <button className="btn btn-primary btn-block" type="submit" disabled={routeInfo.path.length < 2}>Créer la course</button>
      </form>
    </div>
  );
};

// ─── Leaderboard Tab ────────────────────────────────────────
const LeaderboardTab = ({ courses, chronos }) => {
  const sorted = (cid) => chronos.filter(c => c.courseId === cid).sort((a, b) => timeToSeconds(a.temps) - timeToSeconds(b.temps));

  return (
    <div className="card">
      <div className="card-header"><h2>Classements</h2><p>Résultats par course, du plus rapide au plus lent.</p></div>
      {courses.map(course => {
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
      {courses.length === 0 && <div className="empty-state"><p>Aucune course disponible.</p></div>}
    </div>
  );
};

// ─── My Stats Tab ───────────────────────────────────────────
const MyStatsTab = ({ courses, chronos, currentUser, onSwitchTab }) => {
  const myChronos = chronos.filter(c =>
    c.utilisateur === currentUser.username || c.utilisateur === currentUser.name ||
    (c.userId && (c.userId === currentUser._id || c.userId === currentUser.id))
  );

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
    <div className="cgu-section"><h3>1. Objet</h3><p>ChronoTime est une application de chronométrage GPS pour courses de montagne et trail running sur terrain privé.</p></div>
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
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 16 }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')} · v3.0</p>
  </div>
);

// ─── Main App ───────────────────────────────────────────────
const App = () => {
  const [isAuth, setIsAuth] = useState(window.API.isAuthenticated());
  const [user, setUser] = useState(window.API.getCurrentUser());
  const [tab, setTab] = useState(isAuth ? 'chrono-gps' : 'auth');
  const [courses, setCourses] = useState([]);
  const [chronos, setChronos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, path: [], searchQuery: '' });

  const handleAuth = (u) => { setIsAuth(true); setUser(u); setTab('chrono-gps'); };
  const handleLogout = () => { window.API.logout(); setIsAuth(false); setUser(null); setTab('auth'); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesData, chronosData] = await Promise.all([window.API.getCourses(), window.API.getChronos()]);
      if (coursesData && coursesData.length) setCourses(coursesData.map(c => ({ id: c._id, nom: c.nom, distance: c.distance, denivele: c.denivele, tracePath: c.tracePath })));
      if (chronosData && chronosData.length) setChronos(chronosData.map(c => ({ id: c._id, utilisateur: c.utilisateur, courseId: c.courseId && c.courseId._id ? c.courseId._id : c.courseId, temps: c.temps, date: new Date(c.date).toISOString().split('T')[0], userId: c.userId, stats: c.stats })));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (isAuth) loadData(); }, [isAuth]);

  const onChronoSaved = (ch) => {
    if (ch) setChronos(prev => [...prev, { id: ch._id || ch.id, utilisateur: ch.utilisateur, courseId: ch.courseId, temps: ch.temps, date: ch.date || new Date().toISOString().split('T')[0], stats: ch.stats }]);
  };

  if (!isAuth) return <AuthPage onAuth={handleAuth} />;

  const tabs = [
    { id: 'chrono-gps', label: 'Chrono GPS' },
    { id: 'carte', label: 'Tracé' },
    { id: 'course', label: 'Nouvelle course' },
    { id: 'classement', label: 'Classements' },
    { id: 'statistiques', label: 'Mes stats' },
    ...(user && user.isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
    { id: 'cgu', label: 'CGU' },
  ];

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand"><IconMountain /> ChronoTime</div>
          <div className="navbar-user">
            <strong>{user && (user.name || user.username)}</strong>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}><IconLogout /> Déconnexion</button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="container">
          <div className="tabs-bar">
            {tabs.map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {loading && <div className="loading-bar"><div className="spinner"></div>Chargement des données…</div>}

          {!loading && tab === 'chrono-gps' && <GPSChronoTab courses={courses} currentUser={user} onChronoSaved={onChronoSaved} />}
          {!loading && tab === 'carte' && <RouteBuilderTab routeInfo={routeInfo} setRouteInfo={setRouteInfo} onSwitchTab={setTab} />}
          {!loading && tab === 'course' && <AddCourseTab routeInfo={routeInfo} setRouteInfo={setRouteInfo} courses={courses} setCourses={setCourses} onSwitchTab={setTab} />}
          {!loading && tab === 'classement' && <LeaderboardTab courses={courses} chronos={chronos} />}
          {!loading && tab === 'statistiques' && <MyStatsTab courses={courses} chronos={chronos} currentUser={user} onSwitchTab={setTab} />}
          {!loading && tab === 'admin' && user && user.isAdmin && <AdminTab currentUser={user} />}
          {tab === 'cgu' && <CGUTab />}
        </div>
      </div>

      <footer className="app-footer">ChronoTime v3.0 — Trail & Mountain Racing</footer>
    </div>
  );
};

// ─── Mount ──────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
