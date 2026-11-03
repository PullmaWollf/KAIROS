/* Pure Node PNG generator for the neutral default KAIRÓS install icon. */
import {deflateSync} from 'node:zlib';
const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);return c>>>0;});
function crc32(buf){let c=0xffffffff;for(const byte of buf)c=crcTable[(c^byte)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){
 const id=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);
 length.writeUInt32BE(data.length);const body=Buffer.concat([id,data]);crc.writeUInt32BE(crc32(body));
 return Buffer.concat([length,body,crc]);
}
export function makePng(n){
 const raw=Buffer.alloc(n*(n*4+1));const color=[55,33,47,255],light=[245,212,223,255];
 function line(px,py,x1,y1,x2,y2,w){
  const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy)));
  return Math.hypot(px-(x1+t*dx),py-(y1+t*dy))<w;
 }
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const a=x/n,b=y/n,ring=Math.abs(Math.hypot(a-.5,b-.5)-.32)<.014;
  const k=line(a,b,.35,.32,.35,.68,.023)||line(a,b,.35,.51,.65,.31,.023)||line(a,b,.35,.51,.65,.70,.023);
  const chosen=(ring||k)?light:color;const i=y*(n*4+1)+1+x*4;
  for(let c=0;c<4;c++)raw[i+c]=chosen[c];
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(n,0);header.writeUInt32BE(n,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:6})),chunk('IEND',Buffer.alloc(0))]);
}
