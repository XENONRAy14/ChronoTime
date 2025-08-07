// Script pour nettoyer les secrets du code source
// Ce script remplace tous les anciens credentials par des placeholders

const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des secrets dans le code source...');

// Fonction pour nettoyer un fichier
function cleanFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  replacements.forEach(({ search, replace, description }) => {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search, 'g'), replace);
      modified = true;
      console.log(`✅ ${description} nettoyé dans ${filePath}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`💾 Fichier sauvegardé: ${filePath}`);
  }
}

// Patterns à nettoyer (remplacez par vos vraies valeurs si nécessaire)
const replacements = [
  {
    search: 'mongodb+srv://[^"\'\\s]+',
    replace: 'mongodb+srv://username:password@cluster.mongodb.net/database',
    description: 'URI MongoDB'
  },
  {
    search: 'jwt_secret_[^"\'\\s]+',
    replace: 'your_jwt_secret_here',
    description: 'JWT Secret'
  }
];

// Fichiers à nettoyer
const filesToClean = [
  'config.js',
  'server.js',
  '../frontend/api.js'
];

filesToClean.forEach(file => {
  const fullPath = path.join(__dirname, file);
  cleanFile(fullPath, replacements);
});

console.log('✅ Nettoyage terminé !');
console.log('📝 N\'oubliez pas de configurer vos vraies variables dans .env');
