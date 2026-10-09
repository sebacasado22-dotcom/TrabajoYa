import { createClient } from '@supabase/supabase-js';
import './style.css';

const SUPABASE_URL='https://ekhdgrqffmzfnofcwmyn.supabase.co';
const SUPABASE_KEY='sb_publishable_tg7GdjBddJzFZVdDewp4tQ_hOUctau0';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});

async function checkSupabase(){
  try{
    const r=await fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_KEY},cache:'no-store'});
    if(!r.ok) return `Supabase respondió HTTP ${r.status}.`;
    return null;
  }catch(e){
    return 'No se pudo conectar con Supabase desde este teléfono. Revisá Internet, Wi‑Fi/datos móviles y que no haya VPN o bloqueador de red activo.';
  }
}
async function authRequest(fn){
  const network=await checkSupabase();
  if(network)return {error:new Error(network)};
  try{return await fn()}catch(e){return {error:new Error('No se pudo conectar con el servidor. Revisá tu conexión a Internet e intentá nuevamente.')}}
}
let session=null, profile=null, jobs=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>Number(v||0).toLocaleString('es-AR');

function css(){return `<style>
:root{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#17202a;background:#eef1f5}*{box-sizing:border-box}body{margin:0}.app{max-width:480px;margin:auto;min-height:100vh;background:#fff;padding-bottom:calc(100px + env(safe-area-inset-bottom))}.top{background:#155eef;color:#fff;padding:18px 18px 20px;border-radius:0 0 24px 24px;position:sticky;top:0;z-index:10}.brand{font-size:25px;font-weight:900}.sub{opacity:.9;font-size:13px;margin-top:3px}.main{padding:16px}.screen{display:none}.screen.active{display:block}.card,.job{border:1px solid #e1e6ed;border-radius:16px;padding:15px;margin:10px 0;box-shadow:0 3px 14px #0000000b}.hero{background:linear-gradient(135deg,#155eef,#4f8cff);color:white;border:0}.big{font-size:18px;font-weight:800}.muted{color:#687386;font-size:13px}.hero .muted{color:#e9efff}label{display:block;font-size:13px;font-weight:800;margin:10px 0 5px}input,textarea,select{width:100%;padding:12px;border:1px solid #ccd4df;border-radius:11px;font-size:15px;background:#fff}button{border:0;border-radius:11px;padding:11px 14px;background:#155eef;color:#fff;font-weight:800;font-size:14px}button.secondary{background:#eef3ff;color:#155eef}.full{width:100%;margin-top:10px}.danger{background:#ffe9e9;color:#a11}.row{display:flex;gap:8px}.row>*{flex:1}.grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tile{padding:13px;border-radius:13px;background:#f5f7fa;font-weight:700}.pill{display:inline-block;background:#e9f7ee;color:#18733b;border-radius:20px;padding:4px 8px;font-size:11px;font-weight:800}.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(480px,100%);background:#fff;border-top:1px solid #e1e5eb;display:flex;justify-content:space-around;padding:7px 2px calc(10px + env(safe-area-inset-bottom));z-index:20;min-height:66px}.main{padding-bottom:calc(24px + env(safe-area-inset-bottom))}.nav button{min-width:0;flex:1}.nav button{background:none;color:#5e6978;font-size:11px;padding:5px}.nav button.active{color:#155eef}.hidden{display:none!important}.job h3{margin:8px 0 5px}.error{background:#fff0f0;color:#9f1d1d;border-radius:11px;padding:10px;font-size:13px}.ok{background:#eefaf2;color:#176b37;border-radius:11px;padding:10px;font-size:13px}.empty{text-align:center;padding:24px;color:#687386}.auth{padding-top:30px}.price{font-size:30px;font-weight:900;margin-top:8px}.actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.modal{position:fixed;inset:0;background:#0008;display:flex;align-items:flex-end;z-index:50}.modal>div{background:#fff;width:100%;max-width:480px;margin:auto;border-radius:22px 22px 0 0;padding:20px;max-height:90vh;overflow:auto}</style>`}
function renderShell(){document.body.innerHTML=css()+`<div class="app"><header class="top"><div class="brand">🔵 TrabajoYa</div><div class="sub">Trabajo y oportunidades cerca tuyo</div></header><main class="main" id="main"></main><nav class="nav"><button data-nav="home">🏠<br>Inicio</button><button data-nav="jobs">🔎<br>Trabajos</button><button data-nav="post">➕<br>Publicar</button><button data-nav="saved">❤️<br>Guardados</button><button data-nav="profile">👤<br>Perfil</button></nav></div>`;document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav))}
function screen(html){$('#main').innerHTML=html}
async function go(name){document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));if(!session){return auth()} if(name==='home')home(); if(name==='jobs')await jobsScreen(); if(name==='post')postScreen(); if(name==='saved')await savedScreen(); if(name==='profile')profileScreen(); if(name==='applications')await employerApplicationsScreen(); if(name==='myjobs')await employerJobsScreen()}
function auth(msg=''){screen(`<section class="auth"><div class="card hero"><div class="big">Encontrá tu próxima oportunidad.</div><div class="muted">Creá tu cuenta gratis y empezá a usar TrabajoYa.</div></div>${msg?`<div class="error">${esc(msg)}</div>`:''}<div class="card"><h2>Ingresar</h2><label>Email</label><input id="email" type="email" autocomplete="email" placeholder="tu@email.com"><label>Contraseña</label><input id="pass" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres"><button class="full" id="login">INGRESAR</button><button class="full secondary" id="signup">CREAR CUENTA</button><div id="authmsg" class="muted" style="margin-top:10px"></div></div></section>`);$('#login').onclick=login;$('#signup').onclick=signup}
async function login(){const email=$('#email').value.trim(),password=$('#pass').value;if(!email||!password){$('#authmsg').textContent='Ingresá tu email y contraseña.';return}$('#authmsg').textContent='Conectando…';const {error}=await authRequest(()=>supabase.auth.signInWithPassword({email,password}));if(error)$('#authmsg').textContent=error.message;else await boot()}
async function signup(){const email=$('#email').value.trim(),password=$('#pass').value;if(!email){$('#authmsg').textContent='Ingresá un email válido.';return}if(password.length<6){$('#authmsg').textContent='La contraseña debe tener al menos 6 caracteres.';return}$('#authmsg').textContent='Conectando…';const {error}=await authRequest(()=>supabase.auth.signUp({email,password,options:{data:{full_name:email.split('@')[0],role:'worker'}}}));$('#authmsg').textContent=error?error.message:'Cuenta creada. Revisá tu email si Supabase solicita confirmación.'}
async function loadProfile(){if(!session)return;const {data}=await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle();profile=data||{id:session.user.id,full_name:session.user.email?.split('@')[0]||'Usuario',role:'worker'};}
function home(){screen(`<section><div class="card hero"><div class="big">Hola, ${esc(profile?.full_name||'👋')} 👋</div><div class="muted">${profile?.role==='employer'?'Publicá una oferta y encontrá personas.':'Buscá oportunidades y postuláte.'}</div></div><div class="grid"><div class="tile" onclick="window.__go('jobs')">🔎 Buscar trabajo</div><div class="tile" onclick="window.__go('post')">📣 Publicar oferta</div><div class="tile" onclick="window.__calc()">🧾 ¿Cuánto cobro?</div><div class="tile" onclick="window.__go('saved')">❤️ Guardados</div></div><div class="card"><h3>TrabajoYa V2</h3><p class="muted">Cuenta online, ofertas en la nube, postulaciones y favoritos sincronizados.</p></div></section>`)}
async function jobsScreen(){const q=window.__query||'';let query=supabase.from('jobs').select('*').eq('status','active').order('created_at',{ascending:false}).limit(50);if(q)query=query.or(`title.ilike.%${q}%,company.ilike.%${q}%,location.ilike.%${q}%,category.ilike.%${q}%`);const r=await query;jobs=r.data||[];screen(`<section><h2>🔎 Buscar trabajos</h2><div class="row"><input id="search" value="${esc(q)}" placeholder="Puesto, empresa, localidad"><button id="doSearch">Buscar</button></div><div id="jobList">${r.error?`<div class="error">${esc(r.error.message)}</div>`:jobs.length?jobs.map(jobCard).join(''):'<div class="empty">No encontramos ofertas activas todavía.</div>'}</div></section>`);$('#doSearch').onclick=()=>{window.__query=$('#search').value.trim();jobsScreen()}}
function jobCard(j){return `<article class="job"><span class="pill">ACTIVA</span><h3>${esc(j.title)}</h3><div class="muted">🏢 ${esc(j.company||'Empresa')} · 📍 ${esc(j.location||'Sin localidad')}</div><div class="muted">${esc(j.category||'General')}${j.salary?' · 💰 '+esc(j.salary):''}</div><p>${esc(j.description||'')}</p><div class="actions"><button onclick="window.__apply('${j.id}')">📨 Postularme</button><button class="secondary" onclick="window.__save('${j.id}')">❤️ Guardar</button>${j.whatsapp?`<button class="secondary" onclick="window.__wa('${encodeURIComponent(j.whatsapp)}')">WhatsApp</button>`:''}</div></article>`}
function postScreen(){screen(`<section><h2>📣 Publicar oferta</h2><div id="postmsg"></div><label>Puesto</label><input id="jt" placeholder="Ej. Repositor / Operario de depósito"><label>Empresa</label><input id="jc" value="${esc(profile?.company_name||'')}" placeholder="Nombre de la empresa"><label>Localidad</label><input id="jl" value="${esc(profile?.location||'')}" placeholder="Ej. Mendoza"><label>Categoría</label><input id="jcat" placeholder="Ej. Depósito y logística"><label>Salario</label><input id="jsal" placeholder="Ej. $800.000 mensuales"><label>Descripción</label><textarea id="jdesc" rows="5" placeholder="Requisitos, horario, tareas..."></textarea><button class="full" id="publish">PUBLICAR OFERTA</button></section>`);$('#publish').onclick=publishJob}
async function publishJob(){if(profile.role!=='employer'){alert('Para publicar ofertas, cambiá tu perfil a Empresa en Perfil.');return}const payload={employer_id:session.user.id,title:$('#jt').value.trim(),company:$('#jc').value.trim(),location:$('#jl').value.trim(),category:$('#jcat').value.trim(),salary:$('#jsal').value.trim()||null,description:$('#jdesc').value.trim(),status:'active'};if(!payload.title||!payload.company||!payload.description){$('#postmsg').innerHTML='<div class="error">Completá puesto, empresa y descripción.</div>';return}const {error}=await supabase.from('jobs').insert(payload);if(error)$('#postmsg').innerHTML=`<div class="error">${esc(error.message)}</div>`;else{postScreen();$('#postmsg').innerHTML='<div class="ok">Oferta publicada correctamente.</div>'}}

async function apply(id){
  const {data:existing,error:checkError}=await supabase
    .from('applications')
    .select('id')
    .eq('job_id',id)
    .eq('applicant_id',session.user.id)
    .maybeSingle();

  if(checkError){
    alert('No se pudo comprobar tu postulación: '+checkError.message);
    return;
  }

  if(existing){
    alert('Ya te postulaste a esta oferta.');
    return;
  }

  const message=prompt(
    'Mensaje para la empresa (opcional):',
    'Hola, me interesa la oportunidad. Quedo disponible para una entrevista.'
  );

  if(message===null)return;

  const {error}=await supabase
    .from('applications')
    .insert({
      job_id:id,
      applicant_id:session.user.id,
      message:message.trim()||null
    });

  if(error){
    if(error.code==='23505'){
      alert('Ya te postulaste a esta oferta.');
    }else{
      alert('No se pudo enviar la postulación: '+error.message);
    }
    return;
  }

  alert('¡Postulación enviada correctamente!');
}

async function saveJob(id){const {data:exists}=await supabase.from('saved_jobs').select('job_id').eq('user_id',session.user.id).eq('job_id',id).maybeSingle();if(exists){await supabase.from('saved_jobs').delete().eq('user_id',session.user.id).eq('job_id',id);alert('Quitado de guardados.')}else{const {error}=await supabase.from('saved_jobs').insert({user_id:session.user.id,job_id:id});alert(error?'No se pudo guardar.':'Trabajo guardado.')}}
async function savedScreen(){const {data,error}=await supabase.from('saved_jobs').select('job_id,jobs(*)').eq('user_id',session.user.id).order('created_at',{ascending:false});screen(`<section><h2>❤️ Guardados</h2>${error?`<div class="error">${esc(error.message)}</div>`:data?.length?data.map(x=>jobCard(x.jobs)).join(''):'<div class="empty">Todavía no guardaste trabajos.</div>'}</section>`)}
function profileScreen(){screen(`<section><h2>👤 Mi perfil</h2><div class="card"><div class="big">${esc(profile.full_name||'Usuario')}</div><div class="muted">${esc(session.user.email||'')}</div><label>Nombre</label><input id="pn" value="${esc(profile.full_name||'')}"><label>Tipo</label><select id="pr"><option value="worker" ${profile.role==='worker'?'selected':''}>Trabajador</option><option value="employer" ${profile.role==='employer'?'selected':''}>Empresa</option></select><label>Teléfono</label><input id="pp" value="${esc(profile.phone||'')}"><label>Localidad</label><input id="pl" value="${esc(profile.location||'')}" placeholder="La Consulta / Mendoza"><label>Trabajo buscado</label><input id="pj" value="${esc(profile.desired_job||'')}" placeholder="Repositor, depósito, logística..."><label>Experiencia</label><textarea id="pe" rows="3">${esc(profile.experience||'')}</textarea><label>Habilidades</label><textarea id="ps" rows="3">${esc(profile.skills||'')}</textarea><div id="pmsg"></div><button class="full" id="saveP">GUARDAR PERFIL</button>${profile.role==='employer'?'<button class="full secondary" id="myJobsBtn">MIS OFERTAS PUBLICADAS</button><button class="full secondary" id="appsBtn">POSTULACIONES RECIBIDAS</button>':''}<button class="full danger" id="logout">CERRAR SESIÓN</button></div></section>`);$('#saveP').onclick=updateProfile;if($('#myJobsBtn'))$('#myJobsBtn').onclick=()=>go('myjobs');if($('#appsBtn'))$('#appsBtn').onclick=()=>go('applications');$('#logout').onclick=async()=>{await supabase.auth.signOut();session=null;profile=null;auth()}}
async function updateProfile(){const patch={full_name:$('#pn').value.trim(),role:$('#pr').value,phone:$('#pp').value.trim()||null,location:$('#pl').value.trim()||null,desired_job:$('#pj').value.trim()||null,experience:$('#pe').value.trim()||null,skills:$('#ps').value.trim()||null,updated_at:new Date().toISOString()};const {data,error}=await supabase.from('profiles').update(patch).eq('id',session.user.id).select().single();if(error)$('#pmsg').innerHTML=`<div class="error">${esc(error.message)}</div>`;else{profile=data;$('#pmsg').innerHTML='<div class="ok">Perfil actualizado.</div>'}}

async function employerJobsScreen(){
  const {data,error}=await supabase.from('jobs').select('*').eq('employer_id',session.user.id).order('created_at',{ascending:false});
  screen(`<section><h2>📣 Mis ofertas publicadas</h2><button class="secondary" id="backProfile">Volver al perfil</button>${error?`<div class="error">${esc(error.message)}</div>`:data?.length?data.map(j=>`<article class="job"><span class="pill">${esc(j.status||'')}</span><h3>${esc(j.title)}</h3><div class="muted">${esc(j.company||'')} · ${esc(j.location||'')}</div><p>${esc(j.description||'')}</p><button onclick="window.__viewApps('${j.id}')">Ver postulaciones</button></article>`).join(''):'<div class="empty">Todavía no publicaste ofertas.</div>'}</section>`);
  $('#backProfile').onclick=()=>go('profile');
}
async function employerApplicationsScreen(jobId=null){
  const {data:owned,error:ownedError}=await supabase.from('jobs').select('id,title,company').eq('employer_id',session.user.id).order('created_at',{ascending:false});
  if(ownedError){screen(`<section><h2>Postulaciones recibidas</h2><div class="error">No pudimos cargar tus ofertas: ${esc(ownedError.message)}</div><button id="backProfile">Volver al perfil</button></section>`);$('#backProfile').onclick=()=>go('profile');return;}
  const jobsOwned=(owned||[]).filter(j=>!jobId||j.id===jobId);
  if(!jobsOwned.length){screen(`<section><h2>👥 Postulaciones recibidas</h2><div class="empty">No encontramos ofertas publicadas con este perfil.</div><button id="backProfile">Volver al perfil</button></section>`);$('#backProfile').onclick=()=>go('profile');return;}
  const ids=jobsOwned.map(j=>j.id);
  const {data:apps,error}=await supabase.from('applications').select('id,job_id,applicant_id,message,status,created_at').in('job_id',ids).order('created_at',{ascending:false});
  if(error){screen(`<section><h2>👥 Postulaciones recibidas</h2><div class="error">No se pudieron cargar las postulaciones. ${esc(error.message)}. Puede faltar habilitar permisos de lectura para que cada empresa vea las postulaciones de sus ofertas.</div><button id="backProfile">Volver al perfil</button></section>`);$('#backProfile').onclick=()=>go('profile');return;}
  const applicants=[...new Set((apps||[]).map(a=>a.applicant_id))]; let profiles=[];
  if(applicants.length){const p=await supabase.from('profiles').select('id,full_name,phone,location,desired_job,experience,skills').in('id',applicants);profiles=p.data||[];}
  const html=(apps||[]).map(a=>{const j=jobsOwned.find(x=>x.id===a.job_id)||{},p=profiles.find(x=>x.id===a.applicant_id)||{};return `<article class="job"><span class="pill">${esc(a.status||'sent')}</span><h3>${esc(p.full_name||'Candidato')}</h3><div class="muted">Oferta: ${esc(j.title||'')}</div><p><b>Localidad:</b> ${esc(p.location||'No informada')}<br><b>Teléfono:</b> ${esc(p.phone||'No informado')}<br><b>Busca:</b> ${esc(p.desired_job||'No informado')}</p><p><b>Experiencia:</b> ${esc(p.experience||'No informada')}</p><p><b>Habilidades:</b> ${esc(p.skills||'No informadas')}</p><p>${esc(a.message||'Sin mensaje adjunto')}</p><label>Estado de la postulación</label><select id="status-${a.id}"><option value="sent" ${a.status==='sent'?'selected':''}>Recibida</option><option value="reviewing" ${a.status==='reviewing'?'selected':''}>En revisión</option><option value="accepted" ${a.status==='accepted'?'selected':''}>Aceptada</option><option value="rejected" ${a.status==='rejected'?'selected':''}>Rechazada</option></select><button class="full" onclick="window.__updateApp('${a.id}')">Guardar estado</button></article>`}).join('');
  screen(`<section><h2>👥 Postulaciones recibidas</h2><button class="secondary" id="backProfile">Volver al perfil</button>${html||'<div class="empty">Todavía no hay postulaciones para tus ofertas.</div>'}<div id="appmsg"></div></section>`);$('#backProfile').onclick=()=>go('profile');
}
async function updateApplicationStatus(id){const el=$(`#status-${id}`);if(!el)return;const {error}=await supabase.from('applications').update({status:el.value}).eq('id',id);alert(error?`No se pudo actualizar: ${error.message}`:'Estado de la postulación actualizado.');}

function calc(){const m=prompt('Materiales ($)','0'),h=prompt('Horas','1'),vh=prompt('Valor hora ($)','5000'),tr=prompt('Traslado ($)','0'),ot=prompt('Otros gastos ($)','0'),pr=prompt('Ganancia (%)','30');const base=(+m||0)+(+h||0)*(+vh||0)+(+tr||0)+(+ot||0),total=base*(1+(+pr||0)/100);alert(`Precio sugerido: $${money(Math.round(total))}\nBase: $${money(Math.round(base))}`)}
window.__go=go;window.__apply=apply;window.__save=saveJob;window.__viewApps=id=>employerApplicationsScreen(id);window.__updateApp=updateApplicationStatus;window.__wa=n=>location.href='https://wa.me/'+decodeURIComponent(n);window.__calc=calc;
async function boot(){session=(await supabase.auth.getSession()).data.session;if(session){await loadProfile();renderShell();home()}else{renderShell();auth()}supabase.auth.onAuthStateChange(async(_,s)=>{session=s;if(s){await loadProfile();renderShell();home()}else{profile=null;auth()}})}
boot();
