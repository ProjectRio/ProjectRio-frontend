(() => {
  const themes = {
  "mario": {
    "name": "Mario Stadium",
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
    "signature": "Clean diamond \u00b7 no stadium hazard",
    "surround": "Stadium wall & clipped turf",
    "surroundNote": "A narrow grass band sits beneath a blue-grey ballpark wall. Chalk-light dividers and quiet mowing stripes give the page a baseball rhythm.",
    "panel": "A baseball & clean framing",
    "panelNote": "A small stitched ball lives at the header edge. The regular ballpark stays open and uncluttered.",
    "accent": "A calm green scorebook",
    "accentNote": "Dark green rows, cream figures, and fine horizontal rules keep the statistics in focus.",
    "marks": [
      "ball",
      "ball"
    ]
  },
  "bowser": {
    "name": "Bowser Castle",
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
    "signature": "Thwomps & fiery Bubbles",
    "surround": "Stone courses & a lava seam",
    "surroundNote": "Broad stone joints build the header. A thin, warm fissure runs beneath it, leaving the statistics on a flat charcoal surface.",
    "panel": "Thwomp on the parapet",
    "panelNote": "A Thwomp rests against the header edge; a fiery Bubble rises from the warm seam. The shapes identify the castle without a field illustration.",
    "accent": "Charcoal with warm edging",
    "accentNote": "Stone-colored rules and restrained amber highlights frame the familiar v3 controls.",
    "marks": [
      "thwomp",
      "bubble"
    ]
  },
  "wario": {
    "name": "Wario Palace",
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
    "signature": "Chain Chomps & sandstorms",
    "surround": "Sandstone & fine sand",
    "surroundNote": "The header uses warm stone courses over a sandy grain. A linked chain crosses the edge where the Chomp sits.",
    "panel": "A Chomp at the boundary",
    "panelNote": "The dark round head, pale teeth, and metal links form an unmistakable corner treatment. Motion gives it a small tug on the chain.",
    "accent": "Deep umber beneath the sand",
    "accentNote": "Dark reading surfaces and pale sandstone dividers balance the warm exterior.",
    "marks": [
      "chomp",
      "chomp"
    ]
  },
  "yoshi": {
    "name": "Yoshi Park",
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
    "signature": "Piranha Plants",
    "surround": "Painted green & timber edging",
    "surroundNote": "Soft green fills and a light wooden rail carry the storybook field into the page. Warm vertical joints keep the rail distinct from the reading surface.",
    "panel": "Plants peeking over the rail",
    "panelNote": "Piranha Plant heads and leaves interrupt the edge, with a little red against the painted green. They stay clear of the figures.",
    "accent": "A quiet forest-green ledger",
    "accentNote": "Cream figures and sparse row rules preserve the rhythm of the v3 statistics.",
    "marks": [
      "plant",
      "plant"
    ]
  },
  "peach": {
    "name": "Peach Garden",
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
    "signature": "Floating Note Blocks",
    "surround": "Garden green & pale blockwork",
    "surroundNote": "A limestone header, garden-toned body, and warm cream seams suggest the courtyard. Small musical blocks sit above the section edge.",
    "panel": "Floating Note Blocks",
    "panelNote": "The familiar music-note faces become part of the page furniture. A gentle bounce is available without moving the text.",
    "accent": "Garden shade for the data",
    "accentNote": "Dark green surfaces sit within pale stone rims. The blocks supply the character rather than a blanket pink wash.",
    "marks": [
      "note",
      "note"
    ]
  },
  "dk": {
    "name": "DK Jungle",
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
    "signature": "Barrels & Klaptraps",
    "surround": "Weathered wood & a river seam",
    "surroundNote": "Fine wood grain frames the header. A narrow blue-green ribbon runs along its lower edge, with a barrel and Klaptrap nearby.",
    "panel": "Barrel, hoops & teeth",
    "panelNote": "A tilted barrel leans into the header while the Klaptrap follows the waterline. The jungle is carried by these objects and materials.",
    "accent": "Deep green, timber-light rules",
    "accentNote": "The table stays calm and legible; wood texture remains in the framing, outside the numbers.",
    "marks": [
      "barrel",
      "klaptrap"
    ]
  },
  "toy": {
    "name": "Toy Field",
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
    "signature": "The Star Panel",
    "surround": "Blue enamel & inset seams",
    "surroundNote": "Large blue panels, small corner fasteners, and a thin warm-yellow seam make the page feel like part of the Toy Field apparatus.",
    "panel": "A Star Panel in the chrome",
    "panelNote": "The star sits in an inset square at the header edge. Repeated small studs and panel joints carry the same construction through the page.",
    "accent": "A navy instrument panel",
    "accentNote": "The figures sit in a darker blue housing with cool rims. Cream and yellow are reserved for hierarchy and the star.",
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
    const paletteLabels=['Frame','Panel','Accent','Text','Secondary'],paletteIndexes=[0,1,3,4,5];
    const setText=(selector,text)=>{study.querySelector(selector).textContent=text;};
    function apply(key,updateUrl=false){
      const t=themes[key];if(!t)return;
      preview.dataset.webTheme=key;
      study.querySelector('[data-web-hazard]').src='assets/motifs/'+t.marks[0]+'.svg';
      study.querySelector('[data-web-secondary]').src='assets/motifs/'+t.marks[1]+'.svg';
      study.querySelector('[data-web-footer-mark]').src='assets/motifs/'+t.marks[1]+'.svg';
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
