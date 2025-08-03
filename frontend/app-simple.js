// Application React simplifiée pour ChronoMontagne
// Composant principal de l'application
function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('auth');
  const [courses, setCourses] = React.useState([]);
  const [chronos, setChronos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Formulaires
  const [loginForm, setLoginForm] = React.useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = React.useState({ username: '', name: '', password: '' });
  const [authError, setAuthError] = React.useState(null);
  
  // Charger les données au démarrage
  React.useEffect(function() {
    // Vérifier si l'utilisateur est déjà connecté
    const user = window.API && window.API.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setActiveTab('chrono-gps');
      loadData();
    } else {
      setLoading(false);
    }
  }, []);
  
  // Charger les données des courses et des chronos
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Charger les courses
      const coursesData = await window.API.getCourses();
      setCourses(coursesData);
      
      // Charger les chronos
      const chronosData = await window.API.getChronos();
      setChronos(chronosData);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
      setLoading(false);
    }
  }
  
  // Rafraîchir les données
  function refreshData() {
    loadData();
  }
  
  // Changer d'onglet
  function changerOnglet(onglet) {
    setActiveTab(onglet);
  }
  
  // Gérer la connexion
  async function handleLogin(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      await window.API.login(loginForm);
      setIsAuthenticated(true);
      setCurrentUser(window.API.getCurrentUser());
      setActiveTab('chrono-gps');
      loadData();
    } catch (error) {
      setAuthError(error.message || 'Erreur de connexion. Veuillez réessayer.');
    }
  }
  
  // Gérer l'inscription
  async function handleRegister(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      await window.API.register(registerForm);
      setIsAuthenticated(true);
      setCurrentUser(window.API.getCurrentUser());
      setActiveTab('chrono-gps');
      loadData();
    } catch (error) {
      setAuthError(error.message || 'Erreur d\'inscription. Veuillez réessayer.');
    }
  }
  
  // Gérer la déconnexion
  function handleLogout() {
    window.API.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('auth');
  }
  
  // Gérer les changements dans le formulaire de connexion
  function handleLoginChange(e) {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  }
  
  // Gérer les changements dans le formulaire d'inscription
  function handleRegisterChange(e) {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  }
  
  // Rendu du composant
  return (
    <div className="app-container">
      <header>
        <h1>ChronoMontagne</h1>
        <p>Comparez vos temps de course en montagne avec vos amis</p>
        {loading && <div className="loading-indicator">Chargement des données...</div>}
        {error && <div className="error-message">{error}</div>}
      </header>
      
      <div className="tabs">
        {isAuthenticated ? (
          <div className="tab-group">
            <div 
              className={"tab " + (activeTab === 'chrono-gps' ? 'active' : '')}
              onClick={function() { changerOnglet('chrono-gps'); }}
            >
              Chronomètre GPS
            </div>
            <div 
              className={"tab " + (activeTab === 'classement' ? 'active' : '')}
              onClick={function() { changerOnglet('classement'); }}
            >
              Classements
            </div>
            <div className="user-info">
              <span>{currentUser && currentUser.name ? currentUser.name : (currentUser && currentUser.username ? currentUser.username : '')}</span>
              <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
            </div>
          </div>
        ) : (
          <div 
            className={"tab " + (activeTab === 'auth' ? 'active' : '')}
            onClick={function() { changerOnglet('auth'); }}
          >
            Connexion / Inscription
          </div>
        )}
      </div>
      
      {/* Contenu principal */}
      <div className="main-content">
        {/* Onglet d'authentification */}
        {activeTab === 'auth' && (
          <div className="card">
            <div className="auth-tabs">
              <div 
                className={"auth-tab " + (loginForm.username !== '' || (registerForm.username === '' && registerForm.name === '' && registerForm.password === '') ? 'active' : '')}
                onClick={function() { setLoginForm({ username: loginForm.username || '', password: loginForm.password || '' }); }}
              >
                Connexion
              </div>
              <div 
                className={"auth-tab " + (registerForm.username !== '' || registerForm.name !== '' || registerForm.password !== '' ? 'active' : '')}
                onClick={function() { setRegisterForm({ username: registerForm.username || '', name: registerForm.name || '', password: registerForm.password || '' }); }}
              >
                Inscription
              </div>
            </div>
            
            {authError && <div className="error-message">{authError}</div>}
            
            {(loginForm.username !== '' || (registerForm.username === '' && registerForm.name === '' && registerForm.password === '')) ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label htmlFor="username">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                
                <button type="submit">Se connecter</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="form-group">
                  <label htmlFor="register-username">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    id="register-username" 
                    name="username" 
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="name">Nom complet</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="register-password">Mot de passe</label>
                  <input 
                    type="password" 
                    id="register-password" 
                    name="password" 
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <button type="submit">S'inscrire</button>
              </form>
            )}
          </div>
        )}
        
        {/* Onglet du chronomètre GPS */}
        {activeTab === 'chrono-gps' && (
          <div className="card">
            <h2>Chronomètre GPS Automatique</h2>
            <p>Cette fonction utilise votre position GPS pour démarrer et arrêter automatiquement le chronomètre lorsque vous franchissez les points de départ et d'arrivée.</p>
            
            <div className="form-group">
              <label htmlFor="utilisateur-gps">Votre nom</label>
              <input 
                type="text" 
                id="utilisateur-gps" 
                name="utilisateur" 
                value={currentUser && currentUser.name ? currentUser.name : (currentUser && currentUser.username ? currentUser.username : "")}
                disabled={true}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="courseId-gps">Course</label>
              <select 
                id="courseId-gps" 
                name="courseId" 
                required
              >
                <option value="">Sélectionnez une course</option>
                {courses.map(function(course) {
                  return (
                    <option key={course._id} value={course._id}>
                      {course.nom} ({course.distance} km, D+ {course.denivele}m)
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div id="gps-map-container" className="map-container"></div>
            
            <div className="chrono-controls">
              <button type="button">Démarrer le suivi GPS</button>
            </div>
          </div>
        )}
        
        {/* Onglet des classements */}
        {activeTab === 'classement' && (
          <div className="card">
            <h2>Classements par course</h2>
            
            {courses.map(function(course) {
              const courseChronos = chronos.filter(function(chrono) {
                return chrono.courseId === course._id;
              });
              
              return (
                <div key={course._id} style={{marginBottom: '30px'}}>
                  <h3>{course.nom} ({course.distance} km, D+ {course.denivele}m)</h3>
                  
                  {courseChronos.length > 0 ? (
                    <div>
                      {courseChronos.map(function(chrono, index) {
                        return (
                          <div 
                            key={chrono._id} 
                            className={"leaderboard-item " + (index === 0 ? 'top-rank' : index === 1 ? 'second-rank' : index === 2 ? 'third-rank' : '')}
                          >
                            <div className="rank">{index + 1}</div>
                            <div className="user-info">
                              <div><strong>{chrono.utilisateur}</strong></div>
                              <div>Date: {chrono.date}</div>
                            </div>
                            <div className="time">{chrono.temps}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>Aucun chrono enregistré pour cette course.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Rendu de l'application dans l'élément root
ReactDOM.render(<App />, document.getElementById('root'));
