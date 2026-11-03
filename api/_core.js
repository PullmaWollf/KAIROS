import { createClient } from '@supabase/supabase-js';
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCb);
export const DEFAULTS={name:'KAIRÓS',eyebrow:'COMUNIDADE',subtitle:'Um lugar para pertencer',description:'Crescendo juntos em comunhão e fé.',logo_url:'',hero_url:'',primary:'#8f375c',background:'#fff9f8',hero_background:'#37212f',button_one:'Ver mural',button_two:'Nossos encontros',show_decorations:true};
export class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function dbClient(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new HttpError(503,'Banco não configurado');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function txt(v,n=120){return String(v??'').trim().slice(0,n);}
export function assertText(v,min,max,label){const s=txt(v,max+1);if(s.length<min||s.length>max)throw new HttpError(400,label+' inválido');return s;}
export function uuid(v){if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(String(v||'')))throw new HttpError(400,'Identificador inválido');return v;}
export function authRole(u,...roles){if(!u||!roles.includes(u.role))throw new HttpError(403,'Sem permissão');}
export function originCheck(req){const origin=req.headers?.origin;if(!origin)return;const host=req.headers?.['x-forwarded-host']||req.headers?.host;const proto=req.headers?.['x-forwarded-proto']||'https';if(origin!==proto+'://'+host)throw new HttpError(403,'Origem inválida');}
export async function hashPassword(p){
 if(typeof p!=='string'||p.length<12||p.length>256)throw new HttpError(400,'Senha deve ter pelo menos 12 caracteres');
 const salt=randomBytes(16).toString('hex');const derived=await scrypt(p,salt,64);return 'scrypt:'+salt+':'+derived.toString('hex');
}
export async function verifyPassword(p,stored){
 const [kind,salt,hex]=String(stored||'').split(':');if(typeof p!=='string'||p.length>256||kind!=='scrypt'||!salt||!/^[a-f0-9]{128}$/i.test(hex||''))return false;
 const a=await scrypt(p,salt,64),b=Buffer.from(hex,'hex');return timingSafeEqual(a,b);
}
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<48)throw new HttpError(503,'Segredo de sessão não configurado');return s;}
function sign(data){return createHmac('sha256',secret()).update(data).digest('base64url');}
export function createSession(u){const payload=Buffer.from(JSON.stringify({uid:u.id,version:u.session_version,exp:Date.now()+30*864e5})).toString('base64url');return payload+'.'+sign(payload);}
export function parseSession(v){
 const parts=String(v||'').split('.');if(parts.length!==2||parts[0].length>1000)return null;
 const a=Buffer.from(sign(parts[0])),b=Buffer.from(parts[1]);if(a.length!==b.length||!timingSafeEqual(a,b))return null;
 try{const x=JSON.parse(Buffer.from(parts[0],'base64url'));return x.uid&&x.exp>Date.now()?x:null;}catch{return null;}
}
export function sessionCookie(value,maxAge=2592000,secure=true){return 'kairos_session='+value+'; HttpOnly; Path=/; SameSite=Lax; Max-Age='+maxAge+(secure?'; Secure':'');}
export async function dbQuery(promise){const {data,error}=await promise;if(error)throw error;return data;}
export async function currentUser(db,req){
 const c=String(req.headers?.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('kairos_session='));
 const token=parseSession(c?.slice('kairos_session='.length));if(!token)throw new HttpError(401,'Sessão expirada');
 const u=await dbQuery(db.from('app_users').select('id,name,login,role,phone,active,session_version').eq('id',token.uid).maybeSingle());
 if(!u?.active||u.session_version!==token.version)throw new HttpError(401,'Sessão expirada');return u;
}
export function toPublic(u){if(!u)return null;return {id:u.id,name:u.name,login:u.login,role:u.role,phone:u.phone,active:u.active};}
export function brandSafe(data={}){
 const x={...DEFAULTS,...data};const out={};
 for(const k of ['name','eyebrow','subtitle','description','button_one','button_two'])out[k]=txt(x[k],k==='description'?250:120)||DEFAULTS[k];
 for(const k of ['primary','background','hero_background'])out[k]=/^#[a-f0-9]{6}$/i.test(String(x[k]))?x[k]:DEFAULTS[k];
 for(const k of ['logo_url','hero_url']){
  const value=String(x[k]||'');
  try{const u=new URL(value),base=new URL(process.env.SUPABASE_URL||'https://invalid.example');out[k]=u.protocol==='https:'&&u.origin===base.origin&&u.pathname.startsWith('/storage/v1/object/public/kairos-public/')?value:'';}catch{out[k]='';}
 }
 out.show_decorations=x.show_decorations!==false;return out;
}
