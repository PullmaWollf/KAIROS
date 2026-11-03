/* KAIRÓS — client sem credenciais privadas. Interface montada com dados escapados. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const state={page:'home',user:null,public:null,users:[],schedule:[],draftFiles:{},brandingDraft:null};
const admin=()=>state.user?.role==='admin';
const leader=()=>['admin','lider'].includes(state.user?.role);
const notification=(msg)=>{const n=$('notice');n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),4500);};
async function api(route,data,query=''){
 const r=await fetch('/api/'+route+query,{method:data===undefined?'GET':'POST',credentials:'same-origin',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'});
 const x=await r.json().catch(()=>({ok:false,error:'Resposta inválida do servidor'}));
 if(!r.ok||x.ok===false)throw new Error(x.error||'Erro de comunicação');return x;
}
const date=d=>{try{return new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(d));}catch{return '—';}};
const h=(title,subtitle='')=>'<header class="section-head"><div><h2>'+escape(title)+'</h2>'+(subtitle?'<p>'+escape(subtitle)+'</p>':'')+'</div></header>';
const empty=text=>'<div class="empty">'+escape(text)+'</div>';
const can=(role)=>role==='admin'?admin():leader();
function bind(selector,event,handler){document.querySelectorAll(selector).forEach(el=>el.addEventListener(event,handler));}
function go(page){
 if(['admin','users','contacts','attendance','schedule','profile'].includes(page)&&!state.user){notification('Entre na sua conta para continuar');page='login';}
 if(['admin','users'].includes(page)&&!admin()){notification('Acesso exclusivo do administrador');page='home';}
 if(['contacts','attendance'].includes(page)&&!leader()){notification('Acesso da liderança');page='home';}
 state.page=page;navigation();render();window.scrollTo({top:0,behavior:'instant'});
}
function navigation(){
 const options=[['home','Início'],['mural','Mural'],['meetings','Encontros'],['schedule','Escala'],['material','Palavra']];
 if(leader())options.push(['attendance','Frequência'],['contacts','Contatos']);
 if(admin())options.push(['users','Usuários'],['admin','Personalizar']);
 for(const id of ['nav','mobile-nav']){
  const n=$(id);n.replaceChildren();
  for(const [page,text] of options){
   const b=document.createElement('button');b.type='button';b.textContent=text;b.classList.toggle('active',state.page===page);
   b.addEventListener('click',()=>go(page));n.append(b);
  }
 }
 const account=$('account');account.innerHTML=state.user?
  '<button class="btn small" id="profile-button">'+escape(state.user.name.split(' ')[0])+'</button><button class="btn small" id="logout-button">Sair</button>':
  '<button class="btn primary small" id="login-button">Entrar</button>';
 $('profile-button')?.addEventListener('click',()=>go('profile'));
 $('logout-button')?.addEventListener('click',async()=>{try{await api('logout',{});}finally{state.user=null;go('home');notification('Você saiu da conta');}});
 $('login-button')?.addEventListener('click',()=>go('login'));
}
function brand(){
 const b=state.public?.branding||{};
 document.documentElement.style.setProperty('--accent',b.primary||'#8f375c');
 document.documentElement.style.setProperty('--bg',b.background||'#fff9f8');
 document.documentElement.style.setProperty('--hero',b.hero_background||'#37212f');
 $('brand-name').textContent=b.name||'KAIRÓS';
 document.title=(b.name||'KAIRÓS')+' • Comunidade';
 const img=$('brand-icon');img.src=b.logo_url||'/icons/icon.svg';
 const favicon=document.querySelector('link[rel="icon"]');favicon.href=b.logo_url||'/favicon.svg';
}
function home(){
 const b=state.public?.branding||{};
 const next=(state.public?.meetings||[]).filter(x=>new Date(x.starts_at)>=new Date()).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)).slice(0,2);
 return '<section class="hero '+(b.show_decorations===false?'no-decoration':'')+'" style="'+(b.hero_url?'background-image:linear-gradient(#24172088,#24172088),url(&quot;'+escape(b.hero_url)+'&quot;)':'')+'"><div class="content"><span class="eyebrow">'+escape(b.eyebrow||'COMUNIDADE')+'</span><h1>'+escape(b.subtitle||'Um lugar para pertencer')+'</h1><p>'+escape(b.description||'Crescendo juntos em comunhão e fé.')+'</p><div class="hero-actions"><button class="btn primary" data-go="mural">'+escape(b.button_one||'Ver mural')+'</button><button class="btn" data-go="meetings">'+escape(b.button_two||'Nossos encontros')+'</button></div></div></section>'+
 h('Nossa comunidade','Um só lugar para acompanhar os encontros e crescer juntos.')+
 '<section class="grid">'+[
 ['mural','Mural','Publicações e novidades'],
 ['meetings','Encontros','Datas, localizações e avisos'],
 ['schedule','Escala','Funções e responsabilidades']
 ].map(([page,title,desc])=>'<button type="button" class="panel" data-go="'+page+'" style="text-align:left"><h3>'+title+'</h3><p class="muted">'+desc+'</p></button>').join('')+'</section>'+
 h('Próximos encontros')+(next.length?'<div class="grid two">'+next.map(m=>meetingCard(m)).join('')+'</div>':empty('Ainda não há encontros futuros cadastrados.'));
}
function meetingCard(m){
 return '<article class="panel"><span class="tag">'+escape(m.category||'celula')+'</span><h3>'+escape(m.title)+'</h3><div class="card-meta">'+escape(date(m.starts_at))+'</div><p>'+escape(m.location||'Local a confirmar')+'</p><p class="muted">'+escape(m.notes||'')+'</p></article>';
}
function mural(){
 const posts=state.public?.posts||[];
 return h('Mural da comunidade','Compartilhe avisos e novidades.')+
 (leader()?'<div class="panel"><form id="post-form"><label>Título<input name="title" maxlength="140" required></label><label>Mensagem<textarea name="body" maxlength="5000" required></textarea></label><button class="btn primary">Publicar</button></form></div>':'')+
 '<section class="section" style="margin-top:18px">'+(posts.length?posts.map(p=>'<article class="panel"><h3>'+escape(p.title)+'</h3><div class="card-meta">'+escape(date(p.created_at))+'</div><p style="white-space:pre-wrap">'+escape(p.body)+'</p>'+(leader()?'<button class="btn danger small" data-delete-post="'+escape(p.id)+'">Excluir</button>':'')+'</article>').join(''):empty('Nenhuma publicação ainda.'))+'</section>';
}
function meetings(){
 const list=state.public?.meetings||[];
 return h('Encontros','Agenda da sua célula.')+
 (leader()?'<div class="panel"><h3>Novo encontro</h3><form id="meeting-form"><div class="form-grid"><label>Título<input name="title" required maxlength="120"></label><label>Tipo<select name="category"><option value="celula">Célula</option><option value="culto">Culto</option><option value="outro">Outro</option></select></label><label>Data e hora<input name="starts_at" type="datetime-local" required></label><label>Local<input name="location" maxlength="200"></label></div><label>Observações<textarea name="notes" maxlength="1000"></textarea></label><button class="btn primary">Salvar encontro</button></form></div>':'')+
 '<section class="grid two" style="margin-top:18px">'+(list.length?list.map(m=>meetingCard(m)+(leader()?'<div class="actions"><button class="btn small" data-call="'+escape(m.id)+'">Fazer chamada</button>'+(admin()?'<button class="btn danger small" data-delete-meeting="'+escape(m.id)+'">Excluir encontro</button>':'')+'</div>':'' )).join(''):empty('Nenhum encontro cadastrado.'))+'</section>';
}
async function schedule(){
 const data=await api('schedule-read');state.schedule=data.items||[];
 const meetings=state.public?.meetings||[];
 let users=state.users;if(leader()&&!users.length){try{users=(await api('users')).users;state.users=users;}catch{}}
 const form=leader()?'<div class="panel"><h3>Adicionar função</h3><form id="schedule-form"><div class="form-grid"><label>Encontro<select name="meeting_id" required>'+meetings.map(m=>'<option value="'+escape(m.id)+'">'+escape(m.title+' — '+date(m.starts_at))+'</option>').join('')+'</select></label><label>Responsável<select name="user_id"><option value="">Sem responsável</option>'+users.map(u=>'<option value="'+escape(u.id)+'">'+escape(u.name)+'</option>').join('')+'</select></label><label>Função<input name="function_name" placeholder="Ex.: Lanche, recepção" required></label><label>Observações<input name="notes"></label></div><button class="btn primary">Adicionar</button></form></div>':'';
 return h('Escala','Funções por encontro.')+form+'<section class="section" style="margin-top:16px">'+(state.schedule.length?state.schedule.map(x=>'<article class="panel"><div class="row"><div><h3>'+escape(x.function_name)+'</h3><p class="muted">'+escape(x.app_users?.name||'Responsável a definir')+'</p><p class="helper">'+escape(meetings.find(m=>m.id===x.meeting_id)?.title||'Encontro')+'</p></div>'+(leader()?'<button class="btn danger small" data-delete-schedule="'+escape(x.id)+'">Excluir</button>':'')+'</div></article>').join(''):empty('A escala ainda não foi preenchida.'))+'</section>';
}
function material(){
 const m=state.public?.material||{};
 const b=admin()?'<div class="panel"><h3>Publicar Palavra da Célula</h3><form id="material-form"><label>Título<input name="title" value="'+escape(m.title||'Palavra da Célula')+'" required></label><label>Arquivo PDF<input id="material-file" type="file" accept="application/pdf" required></label><button class="btn primary">Enviar PDF e publicar</button></form></div>':'';
 return h('Palavra da Célula','Material para leitura e encontros.')+b+(m.file_url?'<div class="panel" style="margin-top:16px"><h3>'+escape(m.title)+'</h3><a class="btn primary" href="'+escape(m.file_url)+'" target="_blank" rel="noopener noreferrer">Abrir PDF</a></div>':empty('Nenhum material publicado.'));
}
function login(){
 return '<div class="panel" style="max-width:420px;margin:50px auto"><h2>Entrar no KAIRÓS</h2><p class="muted">Utilize as credenciais fornecidas pelo administrador da sua célula.</p><form id="login-form"><label>Login<input name="login" autocomplete="username" required></label><label>Senha<input name="password" type="password" autocomplete="current-password" required></label><button class="btn primary">Entrar</button></form></div>';
}
function profile(){
 return h('Minha conta')+'<div class="panel" style="max-width:600px"><h3>'+escape(state.user.name)+'</h3><p class="muted">'+escape(state.user.role)+'</p><form id="profile-form"><label>Telefone<input name="phone" type="tel" value="'+escape(state.user.phone||'')+'" maxlength="25" placeholder="(62) 99999-9999"></label><button class="btn primary">Salvar meu telefone</button></form></div>';
}
function users(){
 return h('Usuários','Gerencie as contas da sua célula.')+'<div class="panel"><h3>Novo usuário</h3><form id="user-form"><div class="form-grid"><label>Nome<input name="name" maxlength="120" required></label><label>Login<input name="login" maxlength="40" required></label><label>Senha inicial (mín. 12 caracteres)<input type="password" name="password" minlength="12" required></label><label>Perfil<select name="role"><option value="membro">Membro</option><option value="lider">Líder</option><option value="frequentador">Frequentador</option><option value="admin">ADM</option></select></label></div><button class="btn primary">Cadastrar usuário</button></form></div><div id="user-list" class="section" style="margin-top:18px"></div>';
}
function contacts(){
 return h('Contatos','Lista disponível apenas para a liderança.')+'<div class="panel"><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Perfil</th><th>Contato</th></tr></thead><tbody>'+state.users.map(u=>'<tr><td>'+escape(u.name)+'</td><td>'+escape(u.role)+'</td><td>'+(u.phone?'<a href="https://wa.me/'+escape(String(u.phone).replace(/\D/g,''))+'" target="_blank" rel="noopener noreferrer">'+escape(u.phone)+'</a>':'Não informado')+'</td></tr>').join('')+'</tbody></table></div></div>';
}
function attendance(){
 const meetings=state.public?.meetings||[];
 return h('Frequência','Registre presenças e consulte o histórico.')+'<div class="grid two"><div class="panel"><h3>Fazer chamada</h3><form id="attendance-open"><label>Encontro<select name="meeting_id">'+meetings.map(m=>'<option value="'+escape(m.id)+'">'+escape(m.title+' — '+date(m.starts_at))+'</option>').join('')+'</select></label><button class="btn primary">Abrir chamada</button></form></div><div class="panel"><h3>Relatórios</h3><p class="muted">Resumo de participação por membro.</p><button class="btn" id="attendance-report">Consultar frequência</button></div></div><div id="attendance-result" class="section" style="margin-top:18px"></div>';
}
function adminPanel(){
 const b=state.public?.branding||{};
 const field=(label,key,type='text')=>'<label>'+label+'<input name="'+key+'" type="'+type+'" value="'+escape(b[key]||'')+'"></label>';
 return h('Personalização','Seu aplicativo, com a identidade da sua comunidade.')+'<div class="panel"><form id="branding-form">'+
 '<div class="form-grid">'+field('Nome do app','name')+field('Texto superior','eyebrow')+field('Título principal','subtitle')+field('Botão 1','button_one')+field('Botão 2','button_two')+
 field('Cor principal','primary','color')+field('Cor de fundo','background','color')+field('Cor do header','hero_background','color')+'</div>'+
 '<label>Descrição<textarea name="description">'+escape(b.description||'')+'</textarea></label>'+
 '<label>Logo / ícone PWA (imagem quadrada)<input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<label>Imagem do header<input id="hero-file" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<label style="display:flex;gap:8px;align-items:center"><input name="show_decorations" type="checkbox" style="width:auto" '+(b.show_decorations!==false?'checked':'')+'> Mostrar decorações no header</label>'+
 '<p class="helper">O ícone instalado poderá exigir reinstalação para atualizar em dispositivos existentes.</p><button class="btn primary">Publicar identidade</button></form></div>';
}
async function render(){
 const root=$('main');
 try{
  switch(state.page){
   case 'home':root.innerHTML=home();break;
   case 'mural':root.innerHTML=mural();break;
   case 'meetings':root.innerHTML=meetings();break;
   case 'schedule':root.innerHTML=await schedule();break;
   case 'material':root.innerHTML=material();break;
   case 'login':root.innerHTML=login();break;
   case 'profile':root.innerHTML=profile();break;
   case 'users':root.innerHTML=users();await loadUsers();break;
   case 'contacts':state.users=(await api('users')).users;root.innerHTML=contacts();break;
   case 'attendance':root.innerHTML=attendance();break;
   case 'admin':root.innerHTML=adminPanel();break;
   default:root.innerHTML=home();
  }
  bind('[data-go]','click',e=>go(e.currentTarget.dataset.go));
  bindForms();
 }catch(e){root.innerHTML=empty(e.message);notification(e.message);}
}
async function refresh(){state.public=await api('public');brand();navigation();await render();}
async function loadUsers(){
 const list=$('user-list');if(!list)return;
 try{state.users=(await api('users')).users;list.innerHTML=state.users.map(u=>'<article class="panel"><div class="row"><div><strong>'+escape(u.name)+'</strong><p class="helper">'+escape(u.login)+' • '+escape(u.role)+'</p></div><span class="tag">'+(u.active?'Ativo':'Inativo')+'</span></div></article>').join('')||empty('Sem usuários');}catch(e){list.textContent=e.message;}
}
async function logoData(file){
 const image=await createImageBitmap(file);
 try{
  const size=Math.min(image.width,image.height);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  canvas.getContext('2d').drawImage(image,(image.width-size)/2,(image.height-size)/2,size,size,0,0,512,512);
  return canvas.toDataURL('image/png');
 }finally{image.close?.();}
}
async function fileData(file,max=4*1024*1024){
 if(!file)throw new Error('Selecione um arquivo');
 if(file.size>max)throw new Error('Arquivo muito grande (máximo 4 MB)');
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Erro de leitura'));r.readAsDataURL(file);});
}
async function submit(form,handler){
 const button=form.querySelector('button[type="submit"],button:not([type])');
 button.disabled=true;
 try{await handler(Object.fromEntries(new FormData(form)));notification('Alterações salvas!');await refresh();}
 catch(e){notification(e.message);}
 finally{button.disabled=false;}
}
function bindForms(){
 bind('#login-form','submit',e=>{e.preventDefault();submit(e.currentTarget,async d=>{const x=await api('login',{login:d.login,password:d.password});state.user=x.user;state.page='home';});});
 bind('#profile-form','submit',e=>{e.preventDefault();submit(e.currentTarget,async d=>{const x=await api('profile-save',{phone:d.phone});state.user=x.user;});});
 bind('#post-form','submit',e=>{e.preventDefault();submit(e.currentTarget,d=>api('post-save',{title:d.title,body:d.body}));});
 bind('#meeting-form','submit',e=>{e.preventDefault();submit(e.currentTarget,d=>api('meeting-save',d));});
 bind('#schedule-form','submit',e=>{e.preventDefault();submit(e.currentTarget,d=>api('schedule-save',d));});
 bind('#user-form','submit',e=>{e.preventDefault();submit(e.currentTarget,d=>api('user-save',d));});
 bind('#material-form','submit',e=>{e.preventDefault();submit(e.currentTarget,async d=>{const data=await fileData($('material-file').files[0]);const upload=await api('upload',{kind:'pdf',data});await api('material-save',{title:d.title,file_url:upload.url});});});
 bind('#branding-form','submit',e=>{e.preventDefault();submit(e.currentTarget,async d=>{
  const previous=state.public.branding;
  const branding={...previous,...d,show_decorations:e.currentTarget.querySelector('[name="show_decorations"]').checked};
  for(const kind of ['logo','hero']){const file=$(kind+'-file')?.files[0];if(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use PNG, JPEG ou WebP');const data=kind==='logo'?await logoData(file):await fileData(file);branding[kind+'_url']=(await api('upload',{kind,data})).url;}}
  await api('branding-save',{branding});
 });});
 bind('[data-delete-post]','click',async e=>{if(!confirm('Excluir publicação?'))return;try{await api('post-delete',{id:e.currentTarget.dataset.deletePost});await refresh();}catch(x){notification(x.message);}});
 bind('[data-delete-meeting]','click',async e=>{if(!confirm('Excluir encontro e suas chamadas?'))return;try{await api('meeting-delete',{id:e.currentTarget.dataset.deleteMeeting});await refresh();}catch(x){notification(x.message);}});
 bind('[data-delete-schedule]','click',async e=>{try{await api('schedule-delete',{id:e.currentTarget.dataset.deleteSchedule});await refresh();}catch(x){notification(x.message);}});
 bind('[data-call]','click',async e=>{const meetingId=e.currentTarget.dataset.call;state.page='attendance';navigation();await render();const select=document.querySelector('#attendance-open select');if(select)select.value=meetingId;});
 bind('#attendance-open','submit',async e=>{
  e.preventDefault();const id=e.currentTarget.meeting_id.value;try{
   const result=await api('attendance-read',undefined,'?id='+encodeURIComponent(id));
   $('attendance-result').innerHTML='<div class="panel"><h3>Registro de presença</h3>'+result.users.map(u=>{
    const yes=result.attendance.find(a=>a.user_id===u.id)?.present===true;
    return '<div class="user-row"><span>'+escape(u.name)+'</span><button class="btn small '+(yes?'primary':'')+'" data-presence="'+escape(u.id)+'" data-meeting="'+escape(id)+'" data-present="'+String(!yes)+'">'+(yes?'Presente':'Marcar presente')+'</button></div>';
   }).join('')+'</div>';
   bind('[data-presence]','click',async ev=>{const b=ev.currentTarget;try{await api('attendance-save',{meeting_id:b.dataset.meeting,user_id:b.dataset.presence,present:b.dataset.present==='true'});notification('Presença registrada');document.querySelector('#attendance-open').requestSubmit();}catch(x){notification(x.message);}});
  }catch(x){notification(x.message);}
 });
 bind('#attendance-report','click',async()=>{try{
  const r=await api('attendance-report');const output=r.users.map(u=>{
   const rows=r.rows.filter(x=>x.user_id===u.id),present=rows.filter(x=>x.present).length;
   return '<tr><td>'+escape(u.name)+'</td><td>'+present+'</td><td>'+rows.length+'</td></tr>';
  }).join('');
  $('attendance-result').innerHTML='<div class="panel table-wrap"><table><thead><tr><th>Membro</th><th>Presenças</th><th>Registros</th></tr></thead><tbody>'+output+'</tbody></table></div>';
 }catch(x){notification(x.message);}});
}
async function init(){
 try{state.public=await api('public');brand();}catch(e){$('main').innerHTML=empty('KAIRÓS ainda não foi configurado: '+e.message);notification('Configure o Supabase e a Vercel para ativar o aplicativo.');return;}
 try{state.user=(await api('me')).user;}catch{state.user=null;}
 navigation();render();
 if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
})();
