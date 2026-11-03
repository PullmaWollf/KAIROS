import test from 'node:test';
import assert from 'node:assert/strict';
import {makePng} from '../api/_png.js';
for(const n of [192,512]){
 test('ícone PNG padrão '+n+'x'+n,()=>{
  const x=makePng(n);
  assert.equal(x.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(x.readUInt32BE(16),n);
  assert.equal(x.readUInt32BE(20),n);
 });
}
