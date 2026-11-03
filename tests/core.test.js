import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,brandSafe,hashPassword,verifyPassword,createSession,parseSession,sessionCookie,uuid,HttpError} from '../api/_core.js';
test('identidade padrão e sanitização',()=>{
 assert.equal(DEFAULTS.name,'KAIRÓS');
 assert.equal(brandSafe({name:' Comunidade Esperança ',primary:'#123abc'}).name,'Comunidade Esperança');
 assert.equal(brandSafe({primary:'red'}).primary,DEFAULTS.primary);
 assert.equal(brandSafe({logo_url:'https://evil.test/logo.png'}).logo_url,'');
});
test('senhas com salt e verificação segura',async()=>{
 const hash=await hashPassword('SenhaForte!12345');
 assert.ok(hash.startsWith('scrypt:'));
 assert.equal(await verifyPassword('SenhaForte!12345',hash),true);
 assert.equal(await verifyPassword('errado',hash),false);
 await assert.rejects(hashPassword('123'),HttpError);
});
test('sessões assinadas, expiração e cookie HttpOnly',()=>{
 process.env.SESSION_SECRET='x'.repeat(64);
 const u={id:'d4051e45-bf70-4b72-a48d-1205263b8448',session_version:2};
 const token=createSession(u);assert.equal(parseSession(token).version,2);
 assert.equal(parseSession(token+'x'),null);
 assert.match(sessionCookie(token),/HttpOnly/);
});
test('uuid valida entrada',()=>{assert.equal(uuid('d4051e45-bf70-4b72-a48d-1205263b8448').length,36);assert.throws(()=>uuid('1'),HttpError);});
