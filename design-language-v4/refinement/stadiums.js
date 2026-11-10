(() => {
  const themes = {
    mario: {
      name: 'Mario Stadium', number: '01 / 07', tagline: 'Open air. Chalk lines. The familiar diamond.',
      signature: 'Olive turf / warm clay / faded blue stands', direction: 'Open stands.\nWarm clay.',
      description: 'Lead with the open grandstand and the field’s warm clay. The blue of the stands belongs in small details; it should not turn the whole interface blue.',
      keep: 'Open space, chalk-white type, clay warmth, a little stadium blue.', avoid: 'A diagonal lawn pattern standing in for the entire stadium.',
      materials: [['mario-clay','Infield clay'],['mario-trim','Blue stand trim']],
      colors: ['#18262b','#111b22','#bbbba8','#6590c7','#f4f0dd','#b2bcae'],
      source: 'Environment: stadium preview 1746:065. Material references: Mario Stadium entry 8, textures 11 and 49.'
    },
    bowser: {
      name: 'Bowser Castle', number: '02 / 07', tagline: 'Smoke, stone, and a little heat.',
      signature: 'Grey masonry / ember light / purple ironwork', direction: 'Stone first.\nFire second.',
      description: 'The castle should feel heavy and shadowed. Lava is a concentrated source of warmth, not an orange border around every box.',
      keep: 'Heavy stone, warm shadow, sparse molten color.', avoid: 'Repeating brick wallpaper and neon orange trim.',
      materials: [['bowser-arch','Spiked stone'],['bowser-lava','Lava light']],
      colors: ['#241e20','#141114','#b7aaa0','#e89c45','#f5ecda','#b9afa2'],
      source: 'Environment: stadium preview 1746:070. Material references: Bowser Castle entry 11, textures 31 and 9. Entry 13 is not used.'
    },
    wario: {
      name: 'Wario Palace', number: '03 / 07', tagline: 'Sun-baked stone. A very large ego.',
      signature: 'Golden haze / pale sandstone / worn woven banners', direction: 'Warm stone.\nFaded grandeur.',
      description: 'The palace is defined by its glowing sky, monumental shapes, and patterned banners. Give the gold room to breathe against warm, nearly black controls.',
      keep: 'Sandstone, sunset haze, and isolated banner color.', avoid: 'Gold gradients everywhere, dune stripes, or a purple-and-yellow skin.',
      materials: [['wario-sand','Fine dune sand'],['wario-banner','Woven banner']],
      colors: ['#30261d','#1c1814','#c5b698','#d6b779','#fff1cf','#cec1a6'],
      source: 'Environment: stadium preview 1746:067. Material references: Wario Palace entry 14, textures 10 and 33.'
    },
    yoshi: {
      name: 'Yoshi Park', number: '04 / 07', tagline: 'A ballpark made of painted scenery.',
      signature: 'Lilac sky / olive green / cut-out trees', direction: 'Painted scenery.\nSoft daylight.',
      description: 'Keep the park’s stage-set quality: broad painted shapes, timber, and that unexpectedly lilac sky. Its softness is more specific than a bright green theme.',
      keep: 'Painted silhouettes, soft sky color, a warm wooden edge.', avoid: 'Generic clouds, bright mint panels, or repeating egg spots.',
      materials: [['yoshi-cloud','Painted cloud sky'],['yoshi-wood','Woodwork']],
      colors: ['#252837','#171e20','#c0c5b2','#c3b2dd','#f6f2e4','#c2c8b6'],
      source: 'Environment: stadium preview 1746:068. Material references: Yoshi Park entry 15, textures 1 and 22. The blue sky texture differs from the lilac lighting in the preview.'
    },
    peach: {
      name: 'Peach Garden', number: '05 / 07', tagline: 'Garden light, beyond the castle walls.',
      signature: 'Warm limestone / muted sky / terracotta and velvet', direction: 'Garden light.\nWarm limestone.',
      description: 'The pale stone and terracotta do most of the work. Carpet red and garden green are secondary details; the atmosphere should feel composed and spacious.',
      keep: 'Warm limestone, muted garden color, restrained red textile.', avoid: 'Pink gradients, decorative crowns, or an all-over brick grid.',
      materials: [['peach-stone','Mossed masonry'],['peach-carpet','Carpet & gold trim']],
      colors: ['#262a28','#171e1e','#cbbca4','#cb9281','#fff3dc','#c3c7b8'],
      source: 'Environment: stadium preview 1746:066. Material references: Peach Garden entry 17, textures 41 and 85.'
    },
    dk: {
      name: 'DK Jungle', number: '06 / 07', tagline: 'Canopy shade. Timber. Volcanic stone.',
      signature: 'Deep foliage / weathered wood / pale volcanic rock', direction: 'Dense at the edges.\nClear in the middle.',
      description: 'Let the jungle occupy the perimeter. Dark canopy and weathered timber frame a readable center, with pale rock and smoky daylight lifting the scene.',
      keep: 'Canopy depth, carved stone, and a small amount of warm wood.', avoid: 'A wooden sign behind every label or a brown striped background.',
      materials: [['dk-wood','Weathered timber'],['dk-carving','Carved ruin stone']],
      colors: ['#19231e','#101915','#abaf92','#a89462','#f1e8d5','#bac3a8'],
      source: 'Environment: stadium preview 1746:069. Material references: DK Jungle entry 19, textures 51 and 42.'
    },
    toy: {
      name: 'Toy Field', number: '07 / 07', tagline: 'A little machine under a very big sky.',
      signature: 'Deep blue enamel / starfield / warm yellow detail', direction: 'Blue enamel.\nA distant starfield.',
      description: 'Keep the toy’s manufactured character in the surrounding surface. Deep blue and a real starfield create the setting; yellow is a small functional accent.',
      keep: 'Blue panel depth, distant stars, small warm highlights.', avoid: 'A royal-blue rectangle with a yellow stripe or stars on every control.',
      materials: [['toy-panel','Blue panel floor'],['toy-star','Star panel artwork']],
      colors: ['#0d1b32','#101726','#9dacc0','#ecc953','#f0efdf','#aebdd0'],
      source: 'No equivalent stadium-preview image was found. This composition uses Toy Field entry 20: texture 0 (starfield), texture 4 (blue panels), and texture 23 (starburst reference). Its arrangement and perspective are new.'
    }
  };
  const roles = ['ground','surface','rim','accent','ink','muted'];
  const labels = ['Ground','Surface','Neutral rim','Accent','Text','Secondary'];
  document.querySelectorAll('.stadium-study').forEach(study => {
    const setText = (selector, value) => { study.querySelector(selector).textContent = value; };
    function selectTheme(key) {
      const theme = themes[key];
      if (!theme) return;
      study.dataset.stadium = key;
      roles.forEach((role, i) => study.style.setProperty('--park-' + role, theme.colors[i]));
      study.querySelectorAll('[data-park]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.park === key)));
      study.querySelector('.stadium-environment').src = `assets/stadiums/${key}-environment.png`;
      study.querySelector('.stadium-scene').setAttribute('aria-label', `${theme.name} theme specimen`);
      setText('[data-stadium-name]', theme.name);
      setText('[data-stadium-number]', theme.number);
      setText('[data-stadium-tagline]', theme.tagline);
      setText('[data-stadium-signature]', theme.signature);
      setText('[data-stadium-direction]', theme.direction);
      setText('[data-stadium-description]', theme.description);
      setText('[data-stadium-keep]', theme.keep);
      setText('[data-stadium-avoid]', theme.avoid);
      setText('[data-stadium-source]', theme.source);
      ['one','two'].forEach((which, i) => {
        const image = study.querySelector(`[data-material-${which}]`);
        image.src = `assets/stadiums/${theme.materials[i][0]}.png`;
        image.alt = theme.materials[i][1] + ' game texture';
        setText(`[data-material-${which}-label]`, theme.materials[i][1]);
      });
      const palette = study.querySelector('.stadium-palette');
      palette.replaceChildren(...roles.map((role, i) => {
        const item = document.createElement('div');
        const color = document.createElement('i');
        color.style.backgroundColor = theme.colors[i];
        const label = document.createElement('span');
        label.textContent = labels[i];
        const code = document.createElement('code');
        code.textContent = theme.colors[i];
        item.append(color, label, code);
        return item;
      }));
    }
    study.querySelectorAll('[data-park]').forEach(button => button.addEventListener('click', () => selectTheme(button.dataset.park)));
    study.querySelectorAll('[data-depth-choice]').forEach(button => button.addEventListener('click', () => {
      study.dataset.depth = button.dataset.depthChoice;
      study.querySelectorAll('[data-depth-choice]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      setText('[data-depth-description]', button.dataset.depthChoice === 'quiet'
        ? 'Surface-led: only a trace of the environment remains; the interface carries the theme.'
        : 'Environment-led: the park is recognizable, with dark chrome holding the text.');
    }));
    study.querySelectorAll('.stadium-menu button').forEach(button => button.addEventListener('click', () => {
      study.querySelectorAll('.stadium-menu button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    }));
    selectTheme('bowser');
  });
})();
