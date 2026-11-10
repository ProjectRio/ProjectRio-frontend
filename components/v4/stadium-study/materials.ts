import * as THREE from 'three';
import type { Surface } from './themes';

// Original procedural surface studies. No game images are loaded or traced.
export function makeSurface(kind:Surface, hex:string): HTMLCanvasElement {
  const canvas=document.createElement('canvas'); canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d')!;
  let seed=8137;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle=hex;ctx.fillRect(0,0,256,256);
  for(let i=0;i<10000;i++){
    const x=random()*256,y=random()*256,light=random()>.5;
    ctx.fillStyle=kind==='paint' ? (light?'rgba(255,246,220,.007)':'rgba(12,17,14,.009)') : (light?'rgba(255,246,220,.045)':'rgba(12,17,14,.055)');
    ctx.fillRect(x,y,kind==='paint'?12:kind==='turf'?2:1,kind==='paint'?2:1);
  }
  if(kind==='stone'){
    for(let row=0;row<4;row++)for(let col=-1;col<4;col++){
      const x=col*86+(row%2)*43,y=row*64;
      ctx.fillStyle=`rgba(15,20,14,${.025+random()*.08})`;ctx.fillRect(x+3,y+3,80,58);
      ctx.strokeStyle='rgba(19,24,21,.34)';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,84,62);
      ctx.strokeStyle='rgba(255,241,200,.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4,y+59);ctx.lineTo(x+4,y+4);ctx.lineTo(x+80,y+4);ctx.stroke();
      for(let k=0;k<8;k++){ctx.fillStyle='rgba(32,45,27,.08)';ctx.fillRect(x+random()*80,y+random()*60,3+random()*8,2+random()*3);}
    }
  }
  if(kind==='wood'){
    for(let i=0;i<95;i++){
      const y=random()*256;ctx.strokeStyle=`rgba(25,22,13,${.03+random()*.14})`;ctx.lineWidth=.5+random();ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(85,y-5,180,y+6,256,y);ctx.stroke();
    }
    for(let y=0;y<256;y+=64){ctx.fillStyle='#14140e55';ctx.fillRect(0,y,256,2);ctx.fillStyle='#f7ddb522';ctx.fillRect(0,y+2,256,1);}
  }
  if(kind==='enamel'){
    const g=ctx.createLinearGradient(0,0,200,256);g.addColorStop(0,'#d1e7ff14');g.addColorStop(.5,'#ffffff00');g.addColorStop(1,'#07152e20');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
    ctx.strokeStyle='#09152777';ctx.lineWidth=3;ctx.strokeRect(2,2,252,252);ctx.strokeStyle='#cadfff33';ctx.lineWidth=1;ctx.strokeRect(5,5,246,246);
    for(const x of [12,244])for(const y of [12,244]){ctx.fillStyle='#162a48aa';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
  }
  if(kind==='sand'||kind==='clay'||kind==='turf'){
    for(let i=0;i<180;i++){const x=random()*256,y=random()*256;ctx.fillStyle=kind==='turf'?'#cedda00c':'#3b28190e';ctx.beginPath();ctx.ellipse(x,y,random()*12+2,random()*3+1,random()*3,0,Math.PI*2);ctx.fill();}
  }
  if(kind==='lava'){
    const pixels=ctx.createImageData(256,256),tau=Math.PI*2;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const u=x/256*tau,v=y/256*tau;
      const field=Math.sin(u*3+Math.sin(v*2)*1.6)+Math.sin(v*3+Math.cos(u*2)*1.8)+.3*Math.sin(u*7+v*5);
      const heat=Math.pow(Math.max(0,1-Math.abs(field)*1.3),1.8),i=(y*256+x)*4;
      pixels.data[i]=92+heat*160;pixels.data[i+1]=51+heat*139;pixels.data[i+2]=35+heat*48;pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  }
  return canvas;
}

export function surfaceTexture(kind:Surface,hex:string){
  const texture=new THREE.CanvasTexture(makeSurface(kind,hex));
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}
