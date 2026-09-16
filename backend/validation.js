const objectId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
const point = p => p && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Number.isFinite(p.lng) && Math.abs(p.lng) <= 180;
function course(body) {
  if (typeof body.nom !== 'string' || !body.nom.trim() || body.nom.length > 100) return 'Nom requis (100 caractères maximum).';
  if (!Number.isFinite(body.distance) || body.distance <= 0 || body.distance > 2000) return 'Distance invalide.';
  if (!Number.isFinite(body.denivele) || body.denivele < 0 || body.denivele > 20000) return 'Dénivelé invalide.';
  if (!Array.isArray(body.tracePath) || body.tracePath.length < 2 || body.tracePath.length > 500 || !body.tracePath.every(point)) return 'Un tracé de 2 à 500 points GPS valides est requis.';
  return null;
}
function credentials(body, register = false) {
  if (typeof body.username !== 'string' || (register ? !/^[\p{L}\p{N}_.-]{3,40}$/u.test(body.username) : !body.username.trim() || body.username.length > 200)) return 'Pseudo invalide (3 à 40 lettres, chiffres, points ou tirets).';
  if (typeof body.password !== 'string' || Buffer.byteLength(body.password, 'utf8') > 72 || body.password.length < (register ? 8 : 1)) return 'Mot de passe invalide (8 caractères minimum à l’inscription, 72 octets maximum).';
  if (register && (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) return 'Email invalide.';
  if (register && (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80)) return 'Nom requis (80 caractères maximum).';
  return null;
}
module.exports = { objectId, point, course, credentials };
