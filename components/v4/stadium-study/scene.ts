import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { COLLISION_TYPE_KEYS } from '@/components/visualizer/stadiumThemes';
import { studyTheme, surfaceFor } from './themes';
import { surfaceTexture } from './materials';

type Point={Point:{X:number;Y:number;Z:number};CollisionType:number};
export type StadiumData={'Triangle Collections':{Triangles:{Points:Point[];CollectionType:number}[]}[]};

export function createStudyScene(host:HTMLElement,data:StadiumData,id:number,refined:boolean,motion:boolean){
  const theme=studyTheme(id,refined);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
  renderer.domElement.setAttribute('aria-label',`${theme.label}, interactive 3D material study`);
  renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=-1;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(theme.skyBottom);
  scene.fog=new THREE.FogExp2(theme.fog,theme.fogDensity*.7);
  scene.add(new THREE.HemisphereLight(theme.hemi.sky,theme.hemi.ground,theme.hemi.intensity));
  const sun=new THREE.DirectionalLight(theme.sun.color,theme.sun.intensity);sun.position.set(...theme.sun.position);scene.add(sun);
  const fill=new THREE.DirectionalLight('#d8dbe5',.32);fill.position.set(50,50,100);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(43,1,.1,1800);
  camera.position.set(100,88,-105);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,48);
  controls.enableDamping=true;controls.enablePan=false;controls.autoRotate=motion;controls.autoRotateSpeed=.22;
  controls.minDistance=55;controls.maxDistance=310;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.47;controls.update();
  const sky=new THREE.Mesh(new THREE.SphereGeometry(700,32,20),new THREE.ShaderMaterial({
    uniforms:{top:{value:new THREE.Color(theme.skyTop)},bottom:{value:new THREE.Color(theme.skyBottom)}},
    vertexShader:'varying float h; void main(){h=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying float h;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(-15.,340.,h)),1.);}',
    side:THREE.BackSide,depthWrite:false
  }));scene.add(sky);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(10000,10000),new THREE.MeshLambertMaterial({color:theme.ground}));ground.rotation.x=-Math.PI/2;ground.position.y=-5;scene.add(ground);ground.visible=id!==6;
  const groups=new Map<string,{positions:number[];uvs:number[];role:string;foul:boolean}>();
  function triangle(a:Point,b:Point,c:Point,flip:boolean){
    const type=c.CollisionType, role=COLLISION_TYPE_KEYS[type&15]||'oob',foul=(type&240)===128,key=role+(foul?'-f':'');
    if(!groups.has(key))groups.set(key,{positions:[],uvs:[],role,foul});
    const group=groups.get(key)!;
    const points=[a,b,c].map(p=>new THREE.Vector3(p.Point.X,-p.Point.Y,p.Point.Z));
    if(flip)[points[0],points[1]]=[points[1],points[0]];
    const normal=new THREE.Vector3().crossVectors(points[1].clone().sub(points[0]),points[2].clone().sub(points[0])).normalize();
    const horizontal=Math.abs(normal.y)>.55;
    for(const p of points){group.positions.push(p.x,p.y,p.z);group.uvs.push((horizontal?p.x:Math.abs(normal.z)>.5?p.x:p.z)/16,(horizontal?p.z:p.y)/16);}
  }
  for(const box of data['Triangle Collections'])for(const c of box.Triangles){
    const step=c.CollectionType===0?3:1;
    for(let i=0;i+2<c.Points.length;i+=step)triangle(c.Points[i],c.Points[i+1],c.Points[i+2],step===1&&i%2===1);
  }
  const textures:THREE.Texture[]=[];
  const flows:{texture:THREE.Texture;material:THREE.MeshStandardMaterial;lava:boolean}[]=[];
  for(const g of groups.values()){
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.uvs,2));geo.computeVertexNormals();
    const kind=surfaceFor(id,g.role),hex=theme.palette[g.role]||'#888888';
    const mapped=refined&&g.role!=='foulLine';
    const texture=mapped?surfaceTexture(kind,hex):null;if(texture)textures.push(texture);
    const color=new THREE.Color(mapped?'#ffffff':hex);if(g.foul)color.multiplyScalar(refined?.88:theme.foulMult);
    const emissive=theme.emissive[g.role];
    const material=new THREE.MeshStandardMaterial({color,map:texture,roughness:kind==='enamel'?.42:.94,metalness:kind==='enamel'?.13:0,side:THREE.DoubleSide,emissive:emissive||'#000000',emissiveIntensity:kind==='lava'?.5:.12,emissiveMap:emissive?texture:null});
    scene.add(new THREE.Mesh(geo,material));
    if(mapped&&texture&&(kind==='lava'||kind==='water'))flows.push({texture,material,lava:kind==='lava'});
  }
  // Keep the visualizer's simple bonus-pad positions, with muted colors and crisp rings.
  for(const d of theme.decals||[]){
    const disk=new THREE.Mesh(new THREE.CircleGeometry(d.r,48),new THREE.MeshStandardMaterial({color:d.color==='rainbow'?'#ab927c':d.color,roughness:.5}));disk.rotation.x=-Math.PI/2;disk.position.set(d.x,.09,d.z);scene.add(disk);
    const ring=new THREE.Mesh(new THREE.RingGeometry(d.r*.88,d.r*.92,48),new THREE.MeshBasicMaterial({color:'#eadbb6'}));ring.rotation.x=-Math.PI/2;ring.position.set(d.x,.11,d.z);scene.add(ring);
  }
  const particlesGeo=new THREE.BufferGeometry(),particleCount=id===6?220:id===1?45:38;
  const particlePositions=new Float32Array(particleCount*3);
  let seed=42;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<particleCount;i++){particlePositions[i*3]=(random()-.5)*(id===6?900:260);particlePositions[i*3+1]=id===6?-160+random()*380:4+random()*45;particlePositions[i*3+2]=random()*(id===6?800:180)-10;}
  particlesGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const particles=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:id===1?'#efb76c':'#e7e5cf',size:id===6?1.1:.28,sizeAttenuation:id!==6,transparent:true,opacity:id===6?.65:id===1?.6:.32,depthWrite:false,fog:id!==6}));
  if(refined||theme.night)scene.add(particles);
  let running=motion,alive=true,visible=true,frame=0,last=performance.now(),time=0;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.fov=Math.min(72,43*Math.sqrt(1.8/Math.min(1.8,w/h)));camera.updateProjectionMatrix();}});resize.observe(host);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(host);
  const onReduce=()=>{if(reduce.matches)setMotion(false);};reduce.addEventListener('change',onReduce);
  function setMotion(value:boolean){running=value;controls.autoRotate=value;}
  function animate(now:number){
    if(!alive)return;frame=requestAnimationFrame(animate);const delta=Math.min((now-last)/1000,.05);last=now;
    if(!visible||document.hidden)return;
    if(running){time+=delta;
      for(const flow of flows){flow.texture.offset.x=time*.007;flow.texture.offset.y=Math.sin(time*.13)*.045;flow.material.emissiveIntensity=flow.lava?.48+Math.sin(time*.7)*.07:.12;}
      if(id!==6){for(let i=0;i<particleCount;i++){particlePositions[i*3+1]+=delta*(id===1?1.1:.16);if(particlePositions[i*3+1]>50)particlePositions[i*3+1]=2;}particlesGeo.attributes.position.needsUpdate=true;}
      else particles.rotation.y=time*.002;
    }
    controls.update(delta);renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);
  return {
    setMotion,
    reset:()=>{camera.position.set(100,88,-105);controls.target.set(0,1,48);controls.update();},
    overhead:()=>{camera.position.set(0,175,40);controls.target.set(0,0,48);controls.update();},
    dispose:()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();reduce.removeEventListener('change',onReduce);controls.dispose();textures.forEach(t=>t.dispose());scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Points){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose());}});particlesGeo.dispose();(particles.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
