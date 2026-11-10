(() => {
  const themes = {
  "mario": {
    "name": "Mario Stadium",
    "number": "01",
    "colors": [
      "#293f2d",
      "#101f1df5",
      "#aab8a263",
      "#a4b8d0",
      "#f2f0dd",
      "#c2cbb6",
      "#617d72",
      "#d1dbc2"
    ],
    "kicker": "STRIPED TURF / CLAY / CHALK",
    "tagline": "The ballpark, with nothing between you and baseball.",
    "signature": "Clean diamond \u00b7 no stadium hazard",
    "surround": "Mown turf & warm clay",
    "surroundNote": "The infield cutout and diagonal mowing bands carry the theme. Clay remains on the base paths and warning track.",
    "panel": "Clean diamond \u00b7 no stadium hazard",
    "panelNote": "The absence of a hazard is deliberate. Chalk, a baseball, and open grass do the identifying work.",
    "accent": "The same v3 controls",
    "accentNote": "Dark green panels, chalk-toned rims, and a restrained stadium-blue accent."
  },
  "bowser": {
    "name": "Bowser Castle",
    "number": "02",
    "colors": [
      "#353a30",
      "#1b211df5",
      "#a7aaa363",
      "#d6b16f",
      "#f2eddf",
      "#c8c9b6",
      "#5e5744",
      "#adb1a3"
    ],
    "kicker": "STONE DIAMOND / LAVA / THWOMPS",
    "tagline": "Stone underfoot. Thwomps overhead.",
    "signature": "Thwomps & fiery Bubbles",
    "surround": "Stone inside the foul lines",
    "surroundNote": "A flat stone field with its real lava openings. Masonry joints stay on stone; no grass or sandy infield is invented.",
    "panel": "Thwomps & fiery Bubbles",
    "panelNote": "The spiked, scowling silhouette is visible above the outfield. Lava warmth stays near the openings.",
    "accent": "The same v3 controls",
    "accentNote": "Smoky green-grey panels with warm stone rims and small lava-colored details."
  },
  "wario": {
    "name": "Wario Palace",
    "number": "03",
    "colors": [
      "#4a402c",
      "#25251ff5",
      "#c4b28b66",
      "#ddc28a",
      "#f6edda",
      "#d1c8ae",
      "#a28550",
      "#d7c18d"
    ],
    "kicker": "SAND / CHAIN CHOMPS / SANDSTORMS",
    "tagline": "A sandy field with teeth at the foul lines.",
    "signature": "Chain Chomps & sandstorms",
    "surround": "Sand with green base islands",
    "surroundNote": "Sand covers the playing area around isolated green base pads. It is not a grass stadium recolored gold.",
    "panel": "Chain Chomps & sandstorms",
    "panelNote": "Large jaws and linked chains make the two foul-line guardians legible; small sand swirls complete the scene.",
    "accent": "The same v3 controls",
    "accentNote": "Deep olive-brown panels hold the text against a sandy, warm surrounding surface."
  },
  "yoshi": {
    "name": "Yoshi Park",
    "number": "04",
    "colors": [
      "#35442d",
      "#202b28f5",
      "#b8bd9e66",
      "#d6b8b1",
      "#f1efdf",
      "#c8cfb5",
      "#9c8ead",
      "#adc38c"
    ],
    "kicker": "PAINTED GRASS / SAND / PIRANHA PLANTS",
    "tagline": "A storybook field. Watch the flowers.",
    "signature": "Piranha Plants",
    "surround": "Grass with separate sand circles",
    "surroundNote": "The park\u2019s individual sand patches stay distinct within a continuous painted-green field.",
    "panel": "Piranha Plants",
    "panelNote": "Spotted heads, pale jaws, and leafy stems are the recognizable shapes. They are drawn large enough to read.",
    "accent": "The same v3 controls",
    "accentNote": "Forest-green controls balance the plants\u2019 red and the park\u2019s warm timber tones."
  },
  "peach": {
    "name": "Peach Garden",
    "number": "05",
    "colors": [
      "#34412f",
      "#202a25f5",
      "#c7bea366",
      "#ded2ac",
      "#f5efdf",
      "#cbd1b8",
      "#8b8b68",
      "#d3c9aa"
    ],
    "kicker": "GARDEN TURF / CLAY / FLOATING BLOCKS",
    "tagline": "A garden diamond with an unpredictable bounce.",
    "signature": "Floating Note Blocks",
    "surround": "Garden diamond & center-field water",
    "surroundNote": "Turf, clay, the shaped outfield, and its small water feature give the garden a specific footprint.",
    "panel": "Floating Note Blocks",
    "panelNote": "The musical face and pale block edges are used as the signature, rather than an arbitrary pink castle palette.",
    "accent": "The same v3 controls",
    "accentNote": "Shaded green panels and cream edges echo the garden and floating blocks."
  },
  "dk": {
    "name": "DK Jungle",
    "number": "06",
    "colors": [
      "#263b2b",
      "#12231df5",
      "#9eaa8566",
      "#cdb381",
      "#f0ebd8",
      "#c0cbb0",
      "#5a6c44",
      "#a8ba81"
    ],
    "kicker": "JUNGLE GRASS / RIVER / BARRELS",
    "tagline": "A river through the field. Trouble from the outfield.",
    "signature": "Barrels & Klaptraps",
    "surround": "Grass interrupted by river & earth",
    "surroundNote": "The actual river and uneven earth patches break up the field. Timber belongs to the perimeter and barrels.",
    "panel": "Barrels & Klaptraps",
    "panelNote": "Wooden staves and metal hoops identify the barrels. A toothy Klaptrap brings the river into the theme.",
    "accent": "The same v3 controls",
    "accentNote": "Canopy-green panels with timber-toned rims sit below the river and outfield scene."
  },
  "toy": {
    "name": "Toy Field",
    "number": "07",
    "colors": [
      "#203451",
      "#101d31f5",
      "#9dafc76b",
      "#e5c976",
      "#eef0e4",
      "#c1ccdc",
      "#42669a",
      "#90aad0"
    ],
    "kicker": "BLUE PANELS / STAR PANEL / COINS",
    "tagline": "A mechanical field built around the next lucky hit.",
    "signature": "The Star Panel",
    "surround": "An enamel playing surface",
    "surroundNote": "Panel seams replace natural ground texture. Blue metal, inset targets, and warm yellow details set the rhythm.",
    "panel": "The Star Panel",
    "panelNote": "A star and inset scoring discs supply the mechanical character. No foliage, masonry, or clay is added.",
    "accent": "The same v3 controls",
    "accentNote": "Deep navy housings, cool rims, and small yellow details match the panel construction."
  }
};
  document.querySelectorAll('.web-stadium-study').forEach(study=>{
    const preview=study.querySelector('.web-theme');
    const roles=['ground','panel','rim','accent','text','muted','wash','pattern'];
    const paletteLabels=['Surround','Panel','Accent','Text','Secondary'];
    const paletteIndexes=[0,1,3,4,5];
    const setText=(selector,text)=>{study.querySelector(selector).textContent=text;};
    function apply(key,updateUrl=false){
      const t=themes[key];if(!t)return;
      preview.dataset.webTheme=key;
      const field=study.querySelector('[data-web-field]');
      field.src='assets/fields/'+key+(preview.dataset.motion==='on'&&key!=='mario'?'-motion':'')+'.svg';field.alt='Flat field illustration of '+t.name+' with '+t.signature.toLowerCase();
      study.querySelector('[data-web-hazard]').src='assets/fields/'+key+'-mark.svg';
      setText('[data-web-signature]',t.signature);
      const motionControl=study.querySelector('.web-motion');
      motionControl.disabled=key==='mario';
      motionControl.textContent=key==='mario'?'No stadium hazards':'Hazard motion: '+preview.dataset.motion;
      motionControl.setAttribute('aria-pressed',String(key!=='mario'&&preview.dataset.motion==='on'));
      roles.forEach((role,i)=>study.style.setProperty('--web-'+role,t.colors[i]));
      study.querySelectorAll('[data-web-park]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.webPark===key)));
      for(const [selector,value] of Object.entries({name:t.name,number:t.number,kicker:t.kicker,tagline:t.tagline,surround:t.surround,'surround-note':t.surroundNote,panel:t.panel,'panel-note':t.panelNote,accent:t.accent,'accent-note':t.accentNote}))setText('[data-web-'+selector+']',value);
      study.querySelector('.web-theme-palette').replaceChildren(...paletteIndexes.map((index,i)=>{
        const cell=document.createElement('div'),chip=document.createElement('i'),label=document.createElement('span'),code=document.createElement('code');
        chip.style.background=t.colors[index];label.textContent=paletteLabels[i];code.textContent=t.colors[index].slice(0,7);cell.append(chip,label,code);return cell;
      }));
      if(updateUrl){const url=new URL(location.href);url.searchParams.set('park',key);history.replaceState(null,'',url);}
    }
    study.querySelectorAll('[data-web-park]').forEach(button=>button.addEventListener('click',()=>apply(button.dataset.webPark,true)));
    study.querySelectorAll('.web-menu button').forEach(button=>button.addEventListener('click',()=>study.querySelectorAll('.web-menu button').forEach(other=>other.setAttribute('aria-pressed',String(other===button)))));
    const motionButton=study.querySelector('.web-motion'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const motion=(enabled)=>{preview.dataset.motion=enabled?'on':'off';motionButton.setAttribute('aria-pressed',String(enabled));motionButton.textContent='Hazard motion: '+(enabled?'on':'off');apply(preview.dataset.webTheme);};
    motionButton.addEventListener('click',()=>motion(preview.dataset.motion!=='on'&&!reduce.matches));
    reduce.addEventListener('change',()=>{if(reduce.matches)motion(false);});
    const fromUrl=()=>{const key=new URLSearchParams(location.search).get('park');apply(Object.hasOwn(themes,key)?key:'bowser');};
    fromUrl();window.addEventListener('popstate',fromUrl);
  });
})();
