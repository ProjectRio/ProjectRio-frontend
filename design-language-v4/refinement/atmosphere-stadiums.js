(() => {
  const themes = {
    mario:{name:'Mario Stadium',number:'01',kicker:'OLIVE TURF / CHALK / STADIUM BLUE',tagline:'The open-air ballpark, in a quieter register.',colors:['#263c35','#101f1df5','#aab8a263','#8db1ce','#f2f0dd','#bac8b9','#617d72','#d1dbc2'],surround:'Olive ground, open space',surroundNote:'Broad field color and sparse chalk curves around the edge. Clay stays a small warm influence.',panel:'Deep field green',panelNote:'Calm, almost solid surfaces carry the interface. Fine borders borrow their tone from chalk and concrete.',accent:'Faded stadium blue',accentNote:'Blue belongs to the stands and small interface details; warm off-white keeps the type clear.'},
    bowser:{name:'Bowser Castle',number:'02',kicker:'ASH GREY / WARM SHADOW / EMBER',tagline:'Heavy stone around a quiet, readable center.',colors:['#282c2c','#171c1ef2','#a7aaa363','#dfab6f','#f2eddf','#bdc0b6','#5e5744','#adb1a3'],surround:'Weathered grey stone',surroundNote:'Large joints at the perimeter suggest the castle. A small glow near the edge carries the lava warmth.',panel:'Smoky charcoal',panelNote:'Almost solid panels keep stone out of text and numbers. Selection remains a warm neutral.',accent:'Restrained ember',accentNote:'Molten color is reserved for small details. The familiar blue attribute gauges keep their meaning.'},
    wario:{name:'Wario Palace',number:'03',kicker:'WARM SAND / PALE STONE / FADED GOLD',tagline:'A dry, sun-warmed palette with room to breathe.',colors:['#413a2c','#25251ff2','#c4b28b66','#d7bd7a','#f6edda','#c9c3ae','#a28550','#d7c18d'],surround:'Sand & distant warmth',surroundNote:'Fine grain and broad, soft contours suggest the desert. Masonry is not spread across the sandy ground.',panel:'Warm dark umber',panelNote:'Deep, quiet panels provide relief from the golden surround. Borders take a pale sandstone tone.',accent:'Faded banner gold',accentNote:'Warm gold picks out a few small details. It does not become a yellow border around every control.'},
    yoshi:{name:'Yoshi Park',number:'04',kicker:'LILAC SKY / PAINTED OLIVE / TIMBER',tagline:'Soft painted shapes, with a little storybook color.',colors:['#343e36','#202b28f2','#b8bd9e66','#c8b6df','#f1efdf','#c4ccba','#9c8ead','#adc38c'],surround:'Painted scenery',surroundNote:'Flat, cut-out silhouettes and a lilac wash sit behind the header and along the edge.',panel:'Soft forest grey',panelNote:'Smooth panels retain the painted quality. Wood is a reference for warm edging, not a plank behind every label.',accent:'Lilac & warm cream',accentNote:'The sky lends a small color accent. Olive surroundings keep the theme grounded in the actual park.'},
    peach:{name:'Peach Garden',number:'05',kicker:'PALE LIMESTONE / GARDEN GREEN / TERRACOTTA',tagline:'Garden shade framed by warm, pale architecture.',colors:['#374038','#202a25f2','#c7bea366','#d5ab8c','#f5efdf','#c9cdbb','#8b8b68','#d3c9aa'],surround:'Garden & limestone',surroundNote:'An architectural arch is confined to the edge, with a small garden motif beneath it.',panel:'Shaded garden green',panelNote:'Readable green-grey surfaces sit inside a warm limestone rim. Texture stays outside the content.',accent:'Muted terracotta',accentNote:'A trace of warm roof and clay color complements the garden. Pink is not the organizing color.'},
    dk:{name:'DK Jungle',number:'06',kicker:'CANOPY / WEATHERED TIMBER / VOLCANIC ROCK',tagline:'A shaded clearing within a dense green frame.',colors:['#23352d','#12231df2','#9eaa8566','#c6ac77','#f0ebd8','#b8c8ad','#5a6c44','#a8ba81'],surround:'Canopy at the perimeter',surroundNote:'Original foliage silhouettes gather at the corners. Natural terrain is not treated as brick paving.',panel:'Deep canopy green',panelNote:'Calm surfaces evoke a clearing. Warm rims suggest weathered timber without literal wood wallpaper.',accent:'Dry timber & pale rock',accentNote:'Small, warm highlights break up the foliage. The main text takes its lightness from volcanic stone.'},
    toy:{name:'Toy Field',number:'07',kicker:'BLUE ENAMEL / DISTANT STARS / WARM YELLOW',tagline:'A little mechanical polish under a dark sky.',colors:['#17283e','#101d31f2','#9dafc76b','#e5c976','#eef0e4','#b5c4d4','#42669a','#90aad0'],surround:'Blue enamel framing',surroundNote:'A few large inset seams belong to the outer frame. Sparse stars remain separate from the controls.',panel:'Deep blue housings',panelNote:'Smooth, subtly blue panels carry the content. Fine cool rims make their construction legible.',accent:'Warm yellow detail',accentNote:'A small mechanical highlight, balanced by cream lettering. The entire surface does not become a bonus panel.'}
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
    const motion=(enabled)=>{preview.dataset.motion=enabled?'on':'off';motionButton.setAttribute('aria-pressed',String(enabled));motionButton.textContent='Ambient motion: '+(enabled?'on':'off');};
    motionButton.addEventListener('click',()=>motion(preview.dataset.motion!=='on'&&!reduce.matches));
    reduce.addEventListener('change',()=>{if(reduce.matches)motion(false);});
    const fromUrl=()=>{const key=new URLSearchParams(location.search).get('park');apply(Object.hasOwn(themes,key)?key:'bowser');};
    fromUrl();window.addEventListener('popstate',fromUrl);
  });
})();
