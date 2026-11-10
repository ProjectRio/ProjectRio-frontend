(() => {
  const themes = {
  "mario": {
    "name": "Mario Stadium",
    "colors": [
      "#41562b",
      "#13241bf5",
      "#b9bc9466",
      "#edba78",
      "#f3efdb",
      "#c4ccb4",
      "#6c8b33",
      "#c9873f"
    ],
    "signature": "Clean diamond \u00b7 no stadium hazard",
    "surround": "Orange, finely grained clay",
    "surroundNote": "The infield reference is a warm orange clay, visibly different from the surrounding grass. It becomes a broad granular strip under the title, with a fine chalk-colored boundary.",
    "panel": "Olive turf, clipped & directional",
    "panelNote": "Short blades and broad mowing bands give the main header a maintained ballpark surface. The blue stand trim stays a small boundary accent.",
    "accent": "Stitched baseball",
    "accentNote": "A shaded leather ball with red stitching keeps the regular stadium clean; there is no invented hazard.",
    "marks": [
      "ball",
      "ball"
    ]
  },
  "bowser": {
    "name": "Bowser Castle",
    "colors": [
      "#3d4749",
      "#1b2329f5",
      "#9ca9a166",
      "#e99645",
      "#f0eee1",
      "#bdc8c8",
      "#626b65",
      "#a1a58a"
    ],
    "signature": "Thwomps & fiery Bubbles",
    "surround": "Worn stone, not dirt",
    "surroundNote": "The playing surface is stone. Unequal grey-green slabs and worn seams replace the regular brick wallpaper; lava contributes a thin orange glow at the boundary.",
    "panel": "Cold flagstone & warm lava",
    "panelNote": "The grey stone is allowed to stay cool against the amber fissure. Stone belongs here rather than being used as the default material for the other stadiums.",
    "accent": "Thwomp & fiery Bubble",
    "accentNote": "A carved inset face, heavy brows, red eyes, jagged stone outline, and gritted teeth give the Thwomp weight. The Bubble has a layered flame and distinct eyes.",
    "marks": [
      "thwomp",
      "bubble"
    ]
  },
  "wario": {
    "name": "Wario Palace",
    "colors": [
      "#8b713c",
      "#30251bf5",
      "#ccad7e77",
      "#e6c671",
      "#f6eedb",
      "#d5c4a7",
      "#c4a35e",
      "#d0b677"
    ],
    "signature": "Chain Chomps & sandstorms",
    "surround": "Pale granular sand",
    "surroundNote": "Wario is sand on both sides of the baseline, with a subtle shift from pale infield grains to a deeper golden surround. There are no stone courses across the header.",
    "panel": "Golden sand, purple mound accent",
    "panelNote": "The broader sand surface is warmer and denser than Yoshi\u2019s compacted soil. A narrow purple-and-gold edge recalls the mound and palace fabrics; green is a small accent.",
    "accent": "Chain Chomp & sandstorm",
    "accentNote": "A spherical iron body, wide red mouth, separate pointed teeth, bright eye, and interlocking metal links replace the flat Pac-Man outline. The swirl reads as blowing sand.",
    "marks": [
      "chomp",
      "sandstorm"
    ]
  },
  "yoshi": {
    "name": "Yoshi Park",
    "colors": [
      "#426f35",
      "#173125f5",
      "#a8c19066",
      "#f0d893",
      "#f1f0d9",
      "#c4d2b4",
      "#599a38",
      "#bca16c"
    ],
    "signature": "Piranha Plants",
    "surround": "Pale, compacted tan soil",
    "surroundNote": "The reference is a soft beige-gold surface with fine speckling. It stays visibly lighter and less orange than Mario\u2019s clay, paired with a bright living-green header.",
    "panel": "Soft, brushed green grass",
    "panelNote": "Fine grass fibers and gentle color variation replace masonry and wood wallpaper. A small lilac edge borrows the preview\u2019s sky color without turning the field purple.",
    "accent": "Piranha Plants, red & yellow",
    "accentNote": "Full spotted bulbs, thick ivory lips, individual teeth, curved stems, and veined leaves make the plants readable. The yellow companion nods to the park\u2019s special plant.",
    "marks": [
      "plant",
      "plant-yellow"
    ]
  },
  "peach": {
    "name": "Peach Garden",
    "colors": [
      "#466d34",
      "#1d3028f5",
      "#c3b99c77",
      "#edb99b",
      "#f5efdf",
      "#c8cfb5",
      "#659c32",
      "#c27857"
    ],
    "signature": "Floating Note Blocks",
    "surround": "Rose-colored terracotta",
    "surroundNote": "Peach\u2019s ground reference is a pinker, redder clay than Mario\u2019s. A clearly terracotta strip sits below the lawn header; cream edging supplies the garden architecture.",
    "panel": "Dense garden lawn",
    "panelNote": "The turf is a richer, closely textured green. Grass and reddish paths carry the garden identity, with pale stone restricted to the narrow architectural trim.",
    "accent": "Note Block & Brick Block",
    "accentNote": "The musical face is black against an ivory block with beveled edges. A warm brick companion brings the floating block hazards together without making the whole page a brick wall.",
    "marks": [
      "note",
      "brick"
    ]
  },
  "dk": {
    "name": "DK Jungle",
    "colors": [
      "#243d25",
      "#11231df5",
      "#81977677",
      "#cead77",
      "#eee9d4",
      "#b7c9ac",
      "#31552b",
      "#493327"
    ],
    "signature": "Barrels & Klaptraps",
    "surround": "Dark, clumped jungle earth",
    "surroundNote": "The dirt reference is deep brown with coarse mottling and clumps, rather than golden sand. It makes a dark earthy band with just enough warmth to separate it from the surrounding green.",
    "panel": "Rough green ground & water",
    "panelNote": "Uneven tufts and darker organic patches distinguish this header from mown stadium grass. A blue-green water seam and timber-toned edge keep the river and jungle in the framing.",
    "accent": "Barrel & Klaptrap",
    "accentNote": "The barrel has curved wooden staves, an inset top, and riveted hoops. The blue Klaptrap gets a long toothy jaw, raised eyes, a ridged back, and small feet.",
    "marks": [
      "barrel",
      "klaptrap"
    ]
  },
  "toy": {
    "name": "Toy Field",
    "colors": [
      "#223c72",
      "#101d34f5",
      "#8aabd477",
      "#f8d55e",
      "#eff2e6",
      "#bdcce0",
      "#2b4381",
      "#223565"
    ],
    "signature": "The Star Panel",
    "surround": "Inset blue playing panels",
    "surroundNote": "Toy Field has a manufactured floor, so there is no invented soil. The lower strip uses deeper blue panels, crisp seams, and small cross-slot fasteners.",
    "panel": "Cobalt enamel, yellow hardware",
    "panelNote": "The main header is a clearer cobalt with soft enamel highlights. Blue stays separate from yellow hardware and the warm Star Panel rather than becoming a grey metal surface.",
    "accent": "A beveled Star Panel",
    "accentNote": "The star has a clean five-point silhouette, dark oval eyes, warm edges, and a small highlight. It sits in a square inset in the blue housing.",
    "marks": [
      "star",
      "star"
    ]
  }
};
  const stats = {
    batting:{title:'At the plate',headers:['Character','GP','AVG','OBP','SLG','HR'],rows:[['Mario','Mario','284','.326','.381','.514','38'],['Yoshi','Yoshi','267','.348','.402','.469','19'],['Bowser','Bowser','241','.292','.361','.647','62'],['Peach','Peach','218','.317','.389','.438','14'],['Wario','Wario','203','.301','.355','.562','41']]},
    pitching:{title:'On the mound',headers:['Character','GP','IP','ERA','WHIP','SO'],rows:[['Mario','Mario','284','621.2','3.42','1.24','418'],['Yoshi','Yoshi','267','188.0','4.21','1.38','126'],['Bowser','Bowser','241','304.1','3.86','1.31','289'],['Peach','Peach','218','512.0','2.94','1.18','376'],['Wario','Wario','203','176.2','4.43','1.42','101']]}
  };
  document.querySelectorAll('.web-stadium-study').forEach(study=>{
    const preview=study.querySelector('.web-theme');
    const roles=['ground','panel','rim','accent','text','muted','wash','pattern'];
    const paletteLabels=['Field','Infield','Panel','Accent','Text'],paletteIndexes=[6,7,1,3,4];
    const setText=(selector,text)=>{study.querySelector(selector).textContent=text;};
    function apply(key,updateUrl=false){
      const t=themes[key];if(!t)return;
      preview.dataset.webTheme=key;
      study.style.setProperty('--web-field-image',`url("assets/materials-v2/${key}-field.svg")`);
      study.style.setProperty('--web-infield-image',`url("assets/materials-v2/${key}-infield.svg")`);
      study.querySelector('[data-web-hazard-swatch]').src='assets/hazards-v2/'+t.marks[0]+'.svg';
      study.querySelector('[data-web-hazard]').src='assets/hazards-v2/'+t.marks[0]+'.svg';
      study.querySelector('[data-web-secondary]').src='assets/hazards-v2/'+t.marks[1]+'.svg';
      study.querySelector('[data-web-footer-mark]').src='assets/hazards-v2/'+t.marks[1]+'.svg';
      const motionControl=study.querySelector('.web-motion');
      motionControl.disabled=key==='mario';
      motionControl.textContent=key==='mario'?'No stadium hazards':'Ambient motion: '+preview.dataset.motion;
      motionControl.setAttribute('aria-pressed',String(key!=='mario'&&preview.dataset.motion==='on'));
      roles.forEach((role,i)=>study.style.setProperty('--web-'+role,t.colors[i]));
      study.querySelectorAll('[data-web-park]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.webPark===key)));
      for(const [selector,value] of Object.entries({name:t.name,signature:t.signature,surround:t.surround,'surround-note':t.surroundNote,panel:t.panel,'panel-note':t.panelNote,accent:t.accent,'accent-note':t.accentNote}))setText('[data-web-'+selector+']',value);
      study.querySelector('.web-theme-palette').replaceChildren(...paletteIndexes.map((index,i)=>{
        const cell=document.createElement('div'),chip=document.createElement('i'),label=document.createElement('span'),code=document.createElement('code');
        chip.style.background=t.colors[index];label.textContent=paletteLabels[i];code.textContent=t.colors[index].slice(0,7);cell.append(chip,label,code);return cell;
      }));
      if(updateUrl){const url=new URL(location.href);url.searchParams.set('park',key);history.replaceState(null,'',url);}
    }
    function renderStats(mode){
      const data=stats[mode];
      study.querySelector('.web-stats-table').dataset.mode=mode;
      setText('[data-stat-title]',data.title);
      setText('.web-stats-table caption','Illustrative '+mode+' totals by character');
      const head=document.createElement('tr');
      data.headers.forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;head.append(th);});
      study.querySelector('thead').replaceChildren(head);
      study.querySelector('tbody').replaceChildren(...data.rows.map(([name,portrait,...values])=>{
        const tr=document.createElement('tr'),th=document.createElement('th'),img=document.createElement('img'),label=document.createElement('span');
        th.scope='row';img.src='/images/Characters/'+portrait+'.png';img.alt='';label.textContent=name;th.append(img,label);tr.append(th);
        values.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});return tr;
      }));
      study.querySelectorAll('[data-stat-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.statMode===mode)));
    }
    study.querySelectorAll('[data-web-park]').forEach(button=>button.addEventListener('click',()=>apply(button.dataset.webPark,true)));
    study.querySelectorAll('[data-stat-mode]').forEach(button=>button.addEventListener('click',()=>renderStats(button.dataset.statMode)));
    const motionButton=study.querySelector('.web-motion'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const motion=enabled=>{preview.dataset.motion=enabled?'on':'off';apply(preview.dataset.webTheme);};
    motionButton.addEventListener('click',()=>motion(preview.dataset.motion!=='on'&&!reduce.matches));
    reduce.addEventListener('change',()=>{if(reduce.matches)motion(false);});
    const fromUrl=()=>{const key=new URLSearchParams(location.search).get('park');apply(Object.hasOwn(themes,key)?key:'bowser');};
    renderStats('batting');fromUrl();window.addEventListener('popstate',fromUrl);
  });
})();
