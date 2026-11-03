import {makePng} from './_png.js';
import {dbClient,DEFAULTS,HttpError,txt,assertText,uuid,authRole,originCheck,hashPassword,verifyPassword,createSession,sessionCookie,currentUser,toPublic,dbQuery,brandSafe} from './_core.js';
function response(res,status,data){res.setHeader('Cache-Control','no-store');return res.status(status).json(data);}
function needPost(method){if(method!=='POST')throw new HttpError(405,'Use POST');}
function key(v){if(!/^[a-z0-9._-]{3,40}$/.test(v))throw new HttpError(400,'Login inválido');return v;}
function userRole(v){if(!['admin','lider','membro','frequentador'].includes(v))throw new HttpError(400,'Papel inválido');return v;}
async function getBrand(db){const data=await dbQuery(db.from('app_settings').select('value').eq('key','branding').maybeSingle());return brandSafe(data?.value||DEFAULTS);}
function secureUrl(url,prefix){
 const base=new URL(process.env.SUPABASE_URL);let u;try{u=new URL(url);}catch{throw new HttpError(400,'URL de arquivo inválida');}
 if(u.protocol!=='https:'||u.origin!==base.origin||!u.pathname.startsWith('/storage/v1/object/public/kairos-public/'+prefix))throw new HttpError(400,'Arquivo não autorizado');
 return u.href;
}
export default async function handler(req,res){
 try{
  const route=String(req.query?.route||new URL(req.url,'https://localhost').pathname.split('/').pop()).toLowerCase();
  const method=String(req.method||'GET').toUpperCase();
  if(!['GET','POST'].includes(method))throw new HttpError(405,'Método não permitido');
  if(method==='POST'){
   originCheck(req);
   if(Number(req.headers?.['content-length']||0)>7500000)throw new HttpError(413,'Payload muito grande');
  }
  if(route==='icon-192'||route==='icon-512'){
   if(method!=='GET')throw new HttpError(405,'Método não permitido');
   const png=makePng(route==='icon-192'?192:512);
   res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=86400');
   return res.status(200).send(png);
  }
  const db=dbClient();
  if(route==='manifest'){
   const branding=await getBrand(db);
   const logo=branding.logo_url;
   const icons=logo?[{src:logo,sizes:'512x512',type:'image/png',purpose:'any'}]:[
     {src:'/api/icon-192',sizes:'192x192',type:'image/png',purpose:'any'},
     {src:'/api/icon-512',sizes:'512x512',type:'image/png',purpose:'any'}
   ];
   res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/manifest+json; charset=utf-8');
   return res.status(200).send(JSON.stringify({id:'/',name:branding.name,short_name:branding.name.slice(0,24),start_url:'/',scope:'/',display:'standalone',lang:'pt-BR',background_color:branding.background,theme_color:branding.primary,icons}));
  }
  if(route==='public'){
   const [branding,meetings,posts,material]=await Promise.all([
    getBrand(db),
    dbQuery(db.from('meetings').select('id,title,category,starts_at,location,notes').order('starts_at',{ascending:false}).limit(40)),
    dbQuery(db.from('posts').select('id,title,body,created_at').order('created_at',{ascending:false}).limit(40)),
    dbQuery(db.from('study_material').select('title,file_url').eq('id',true).maybeSingle())
   ]);
   return response(res,200,{ok:true,branding,meetings,posts,material});
  }
  if(route==='login'){
   needPost(method);
   const login=key(txt(req.body?.login,40).toLowerCase()),password=String(req.body?.password||'');
   const account=await dbQuery(db.from('app_users').select('*').eq('login',login).maybeSingle());
   if(!account?.active||!await verifyPassword(password,account.password_hash))throw new HttpError(401,'Login ou senha incorretos');
   res.setHeader('Set-Cookie',sessionCookie(createSession(account),2592000,process.env.NODE_ENV!=='development'));
   return response(res,200,{ok:true,user:toPublic(account)});
  }
  if(route==='logout'){
   needPost(method);res.setHeader('Set-Cookie',sessionCookie('',0,process.env.NODE_ENV!=='development'));
   return response(res,200,{ok:true});
  }
  const u=await currentUser(db,req);
  if(route==='me')return response(res,200,{ok:true,user:toPublic(u)});
  if(route==='users'){
   authRole(u,'admin','lider');
   const users=await dbQuery(db.from('app_users').select('id,name,login,role,phone,active').order('name'));
   return response(res,200,{ok:true,users});
  }
  if(route==='profile-save'){
   needPost(method);
   const phone=txt(req.body?.phone,25);if(phone&&!/^\+?[0-9 ()-]{10,25}$/.test(phone))throw new HttpError(400,'Telefone inválido');
   const result=await dbQuery(db.from('app_users').update({phone}).eq('id',u.id).select('id,name,login,role,phone,active').single());
   return response(res,200,{ok:true,user:toPublic(result)});
  }
  if(route==='user-save'){
   needPost(method);authRole(u,'admin');
   const name=assertText(req.body?.name,2,120,'Nome'),login=key(assertText(req.body?.login,3,40,'Login').toLowerCase()),role=userRole(String(req.body?.role||'membro'));
   let user;
   if(req.body?.id){
    const target=uuid(req.body.id);
    if(target===u.id&&(role!=='admin'||req.body?.active===false))throw new HttpError(400,'Você não pode desativar ou remover sua própria conta administrativa');
    const payload={name,login,role,active:req.body?.active!==false};
    if(req.body?.password){
     const old=await dbQuery(db.from('app_users').select('session_version').eq('id',target).single());
     payload.password_hash=await hashPassword(req.body.password);payload.session_version=old.session_version+1;
    }
    user=await dbQuery(db.from('app_users').update(payload).eq('id',target).select('id,name,login,role,phone,active').single());
   }else{
    if(!req.body?.password)throw new HttpError(400,'Informe senha do novo usuário');
    user=await dbQuery(db.from('app_users').insert({name,login,role,password_hash:await hashPassword(req.body.password)}).select('id,name,login,role,phone,active').single());
   }
   return response(res,200,{ok:true,user:toPublic(user)});
  }
  if(route==='branding-save'){
   needPost(method);authRole(u,'admin');
   const branding=brandSafe(req.body?.branding||{});
   await dbQuery(db.from('app_settings').upsert({key:'branding',value:branding,updated_at:new Date().toISOString()},{onConflict:'key'}));
   return response(res,200,{ok:true,branding});
  }
  if(route==='upload'){
   needPost(method);authRole(u,'admin');
   const kind=String(req.body?.kind||'');if(!['logo','hero','pdf'].includes(kind))throw new HttpError(400,'Tipo inválido');
   const match=String(req.body?.data||'').match(/^data:(image\/png|image\/jpeg|image\/webp|application\/pdf);base64,([a-z0-9+/=]+)$/i);
   if(!match||(kind==='pdf')!==(match[1]==='application/pdf'))throw new HttpError(400,'Formato inválido');
   const buffer=Buffer.from(match[2],'base64');
   if(buffer.length<50||buffer.length>4*1024*1024)throw new HttpError(413,'Arquivo fora do limite');
   const ext=match[1]==='application/pdf'?'pdf':match[1].split('/')[1].replace('jpeg','jpg');
   const path='branding/'+kind+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
   await dbQuery(db.storage.from('kairos-public').upload(path,buffer,{contentType:match[1],upsert:false}));
   return response(res,200,{ok:true,url:db.storage.from('kairos-public').getPublicUrl(path).data.publicUrl});
  }
  if(route==='post-save'){
   needPost(method);authRole(u,'admin','lider');
   const post=await dbQuery(db.from('posts').insert({author_id:u.id,title:assertText(req.body?.title,1,140,'Título'),body:assertText(req.body?.body,1,5000,'Texto')}).select('id,title,body,created_at').single());
   return response(res,200,{ok:true,post});
  }
  if(route==='post-delete'){
   needPost(method);authRole(u,'admin','lider');
   await dbQuery(db.from('posts').delete().eq('id',uuid(req.body?.id)));return response(res,200,{ok:true});
  }
  if(route==='meeting-save'){
   needPost(method);authRole(u,'admin','lider');
   const starts=new Date(req.body?.starts_at);const category=String(req.body?.category||'celula');
   if(Number.isNaN(starts.getTime())||!['celula','culto','outro'].includes(category))throw new HttpError(400,'Data ou categoria inválida');
   const entry={title:assertText(req.body?.title,2,120,'Título'),starts_at:starts.toISOString(),category,location:txt(req.body?.location,200),notes:txt(req.body?.notes,1000)};
   const query=req.body?.id?db.from('meetings').update(entry).eq('id',uuid(req.body.id)):db.from('meetings').insert(entry);
   const meeting=await dbQuery(query.select('*').single());
   return response(res,200,{ok:true,meeting});
  }
  if(route==='meeting-delete'){
   needPost(method);authRole(u,'admin');await dbQuery(db.from('meetings').delete().eq('id',uuid(req.body?.id)));
   return response(res,200,{ok:true});
  }
  if(route==='attendance-read'){
   authRole(u,'admin','lider');const meeting_id=uuid(req.query?.id||req.body?.id);
   const [users,attendance]=await Promise.all([dbQuery(db.from('app_users').select('id,name,role').eq('active',true).order('name')),dbQuery(db.from('attendance').select('user_id,present').eq('meeting_id',meeting_id))]);
   return response(res,200,{ok:true,users,attendance});
  }
  if(route==='attendance-save'){
   needPost(method);authRole(u,'admin','lider');
   await dbQuery(db.from('attendance').upsert({meeting_id:uuid(req.body?.meeting_id),user_id:uuid(req.body?.user_id),present:req.body?.present===true,updated_at:new Date().toISOString()},{onConflict:'meeting_id,user_id'}));
   return response(res,200,{ok:true});
  }
  if(route==='attendance-report'){
   authRole(u,'admin','lider');
   const [users,rows,meetings]=await Promise.all([dbQuery(db.from('app_users').select('id,name,role').eq('active',true)),dbQuery(db.from('attendance').select('user_id,meeting_id,present')),dbQuery(db.from('meetings').select('id,title,starts_at,category'))]);
   return response(res,200,{ok:true,users,rows,meetings});
  }
  if(route==='schedule-read'){
   const items=await dbQuery(db.from('schedule_items').select('id,meeting_id,user_id,function_name,notes,app_users(name)').order('created_at'));
   return response(res,200,{ok:true,items});
  }
  if(route==='schedule-save'){
   needPost(method);authRole(u,'admin','lider');
   const entry={meeting_id:uuid(req.body?.meeting_id),user_id:req.body?.user_id?uuid(req.body.user_id):null,function_name:assertText(req.body?.function_name,2,100,'Função'),notes:txt(req.body?.notes,300)};
   const item=await dbQuery(db.from('schedule_items').insert(entry).select('*').single());
   return response(res,200,{ok:true,item});
  }
  if(route==='schedule-delete'){
   needPost(method);authRole(u,'admin','lider');
   await dbQuery(db.from('schedule_items').delete().eq('id',uuid(req.body?.id)));return response(res,200,{ok:true});
  }
  if(route==='material-save'){
   needPost(method);authRole(u,'admin');
   const title=assertText(req.body?.title,2,140,'Título');
   const file_url=secureUrl(String(req.body?.file_url||''),'branding/pdf-');
   await dbQuery(db.from('study_material').upsert({id:true,title,file_url,updated_at:new Date().toISOString()},{onConflict:'id'}));
   return response(res,200,{ok:true});
  }
  throw new HttpError(404,'Rota não encontrada');
 }catch(error){
  if(!(error instanceof HttpError))console.error('[kairos] operação falhou:',error?.message||error);
  return response(res,error instanceof HttpError?error.status:500,{ok:false,error:error instanceof HttpError?error.message:'Erro interno'});
 }
}
