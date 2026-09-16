/* API defaults to the same server. No implicit calls to a former deployment. */
const API_URL = (window.CHRONOTIME_API_URL || '/api').replace(/\/$/,'');
function getToken() { return localStorage.getItem('token'); }
async function safeFetch(url, options={}) {
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try {
    const token=getToken();
    const res=await fetch(url,{...options,signal:controller.signal,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...options.headers}});
    const data=await res.json().catch(()=>null);
    if(res.status===401 && token){logout();window.dispatchEvent(new Event('auth-expired'));}
    if(!res.ok) throw new Error(data?.message || `Erreur ${res.status}`);
    if(data===null) throw new Error('Réponse serveur invalide. Vérifiez la configuration API.');
    return data;
  } catch(error) {
    if(error.name==='AbortError')throw new Error('Le serveur met trop de temps à répondre. Réessayez.');
    throw error;
  } finally {clearTimeout(timer);}
}
async function authenticate(path,body){const data=await safeFetch(`${API_URL}/auth/${path}`,{method:'POST',body:JSON.stringify(body)});localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));return data;}
function logout(){localStorage.removeItem('token');localStorage.removeItem('user');}
function getCurrentUser(){try{return JSON.parse(localStorage.getItem('user'));}catch{return null;}}
window.API={API_URL,logout,getCurrentUser,isAuthenticated:()=>!!getToken() && !!getCurrentUser(),
 login:body=>authenticate('login',body),register:body=>authenticate('register',body),
 getUser:()=>safeFetch(`${API_URL}/auth/user`),
 getCourses:()=>safeFetch(`${API_URL}/courses`),getChronos:()=>safeFetch(`${API_URL}/chronos`),
 createCourse:body=>safeFetch(`${API_URL}/courses`,{method:'POST',body:JSON.stringify(body)}),
 createChrono:body=>safeFetch(`${API_URL}/chronos`,{method:'POST',body:JSON.stringify(body)}),
 getAllUsers:()=>safeFetch(`${API_URL}/admin/users`),getAdminStats:()=>safeFetch(`${API_URL}/admin/stats`),
 deleteUser:id=>safeFetch(`${API_URL}/admin/users/${id}`,{method:'DELETE'}),
 promoteUser:id=>safeFetch(`${API_URL}/admin/users/${id}/promote`,{method:'PATCH'}),
 demoteUser:id=>safeFetch(`${API_URL}/admin/users/${id}/demote`,{method:'PATCH'})};
