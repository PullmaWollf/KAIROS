import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync,existsSync}from'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('repositório sem segredos reais e com caminhos de setup',()=>{
 assert.ok(existsSync(new URL('../.env.example',import.meta.url)));
 assert.ok(!existsSync(new URL('../.env',import.meta.url)));
 assert.match(read('README.md'),/KAIRÓS/);
 assert.match(read('docs/INSTALL.md'),/Supabase/);
 assert.match(read('docs/AUTOMATION.md'),/Automação/);
});
test('migração segura não expõe tables ao client anon',()=>{
 const sql=read('supabase/migrations/20261103000000_kairos_initial.sql');
 assert.match(sql,/revoke all/i);
 assert.match(sql,/enable row level security/i);
});
test('PWA está no documento de entrada',()=>{
 const html=read('index.html');
 assert.match(html,/manifest\.webmanifest/);
 assert.match(html,/src\/app\.js/);
});
