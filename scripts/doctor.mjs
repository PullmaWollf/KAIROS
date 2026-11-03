/**
 * Diagnóstico de implantação da própria célula. Não imprime chaves, tokens ou dados de usuários.
 * Uso: npm run doctor (Node 24 lê .env.local antes da execução).
 */
import {createClient} from '@supabase/supabase-js';
const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SESSION_SECRET'];
const missing=required.filter(k=>!process.env[k]||/SEU-PROJETO|INSIRA_|GERE_UM_/.test(process.env[k]));
if(missing.length){console.error('Variáveis não configuradas: '+missing.join(', '));process.exitCode=1;}
else if(process.env.SESSION_SECRET.length<48){console.error('SESSION_SECRET precisa ter 48 caracteres ou mais.');process.exitCode=1;}
else {
 try{
  const url=new URL(process.env.SUPABASE_URL);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))throw new Error('SUPABASE_URL deve apontar para o projeto Supabase da célula');
  const db=createClient(url.href,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const {data,error}=await db.from('app_settings').select('key').eq('key','branding').maybeSingle();
  if(error||!data)throw new Error('Tabela app_settings indisponível. Confira a migração SQL e as permissões.');
  const users=await db.from('app_users').select('id',{head:true,count:'exact'});
  if(users.error)throw new Error('Tabela app_users indisponível.');
  const bucket=await db.storage.getBucket('kairos-public');
  if(bucket.error||!bucket.data)throw new Error('Bucket kairos-public indisponível.');
  console.log('KAIRÓS: Supabase conectado, schema e Storage encontrados.');
  console.log('Ambiente pronto para executar o cadastro inicial do ADM e configurar a Vercel.');
 }catch(e){console.error('Falha no diagnóstico: '+e.message);process.exitCode=1;}
}
