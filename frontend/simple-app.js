// Application React simplifiée pour ChronoMontagne
const { useState, useEffect } = React;

// Composant principal de l'application
const SimpleApp = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au démarrage
  useEffect(() => {
    async function loadData() {
      try {
        // Charger les courses
        const coursesData = await fetch('http://localhost:9000/api/courses')
          .then(response => response.json());
        
        setCourses(coursesData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="container">
      <header>
        <h1>ChronoMontagne</h1>
        <p>Comparez vos temps de course en montagne avec vos amis</p>
        {loading && <div className="loading-indicator">Chargement des données...</div>}
        {error && <div className="error-message">{error}</div>}
      </header>
      
      <div className="card">
        <h2>Courses disponibles</h2>
        {courses.length > 0 ? (
          <ul>
            {courses.map(course => (
              <li key={course._id}>
                {course.nom} - {course.distance} km, D+ {course.denivele}m
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune course disponible.</p>
        )}
      </div>
    </div>
  );
};

// Rendu du composant dans le DOM
ReactDOM.render(<SimpleApp />, document.getElementById('root'));
