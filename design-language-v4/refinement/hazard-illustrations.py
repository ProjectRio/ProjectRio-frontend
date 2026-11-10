"""Second-pass hazard illustrations: original SVG drawing, not extracted sprites.
128-unit drawings retain expressive silhouettes and legible faces at 48–88px.
"""
from pathlib import Path
out=Path(__file__).resolve().parent/'assets/hazards-v2';out.mkdir(parents=True,exist_ok=True)
DEFS='''<defs>
 <linearGradient id="stone" x2=".8" y2="1"><stop stop-color="#d2dad7"/><stop offset=".45" stop-color="#95a6ab"/><stop offset="1" stop-color="#61757e"/></linearGradient>
 <linearGradient id="face" x2="0" y2="1"><stop stop-color="#7e9197"/><stop offset="1" stop-color="#4b616a"/></linearGradient>
 <radialGradient id="iron" cx=".3" cy=".2" r=".8"><stop stop-color="#5f7690"/><stop offset=".4" stop-color="#243b54"/><stop offset=".78" stop-color="#101d30"/><stop offset="1" stop-color="#080e1b"/></radialGradient>
 <linearGradient id="red" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#ff7356"/><stop offset=".45" stop-color="#dc362e"/><stop offset="1" stop-color="#9a1925"/></linearGradient>
 <linearGradient id="lip" x2=".7" y2="1"><stop stop-color="#fffce8"/><stop offset=".5" stop-color="#f3edce"/><stop offset="1" stop-color="#bfc5a6"/></linearGradient>
 <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#96c843"/><stop offset=".45" stop-color="#4f9e3b"/><stop offset="1" stop-color="#236633"/></linearGradient>
 <linearGradient id="wood" x2="1" y2=".15"><stop stop-color="#71401e"/><stop offset=".24" stop-color="#c58b47"/><stop offset=".55" stop-color="#b57536"/><stop offset="1" stop-color="#6a3d21"/></linearGradient>
 <linearGradient id="metal" x2="1" y2=".4"><stop stop-color="#63716a"/><stop offset=".25" stop-color="#d4d4ac"/><stop offset=".5" stop-color="#909a85"/><stop offset="1" stop-color="#465a53"/></linearGradient>
 <linearGradient id="blue" x2=".2" y2="1"><stop stop-color="#74a9db"/><stop offset=".48" stop-color="#4279b5"/><stop offset="1" stop-color="#264d82"/></linearGradient>
 <radialGradient id="fire" cx=".55" cy=".7" r=".75"><stop stop-color="#fff4a1"/><stop offset=".45" stop-color="#ffcc49"/><stop offset=".75" stop-color="#fb8526"/><stop offset="1" stop-color="#d94b23"/></radialGradient>
 <linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#fff59d"/><stop offset=".5" stop-color="#f9d449"/><stop offset="1" stop-color="#c68a1e"/></linearGradient>
 </defs>'''
art={}
art['thwomp']='''
<g stroke="#344e5a" stroke-width="2" stroke-linejoin="round">
 <path d="M18 22L16 9L31 16L37 4L47 14L61 3L69 13L84 5L90 17L106 10L105 25L120 28L111 42L124 51L113 63L125 76L111 84L120 99L105 102L106 117L91 110L84 123L71 113L61 125L50 114L36 121L31 110L16 116L18 102L4 98L12 84L2 75L13 63L3 51L15 42L6 28Z" fill="url(#stone)"/>
 <path d="M24 22H101L105 105H22Z" fill="#c4cfcc"/>
 <path d="M29 28L95 27L100 99L28 102Z" fill="url(#face)"/>
 <path d="M24 22L29 28L28 102L22 105M95 27L101 22M100 99L105 105" stroke="#ebedd8" stroke-width="1.4"/>
 <path d="M36 45Q46 39 57 52L55 66L39 65Z" fill="#f1edcb"/>
 <path d="M90 44Q80 39 68 52L71 66L88 64Z" fill="#f1edcb"/>
 <path d="M49 49L50 62M76 49L75 62" stroke="#bd4038" stroke-width="6"/><path d="M50 51V62M75 51V62" stroke="#242b33" stroke-width="2.5"/>
 <path d="M32 39L58 52L59 45L37 35ZM94 38L67 52L66 45L90 34Z" fill="#b4c3c1"/>
 <path d="M58 61L64 55L70 68L64 72L57 68" fill="#82979b"/>
 <path d="M39 87Q47 75 61 78Q77 73 88 85L88 95L76 91L64 94L52 91L39 95Z" fill="#263941"/>
 <path d="M43 85Q61 80 83 84L81 89L43 90Z" fill="#e5e7d1" stroke="none"/>
 <path d="M50 83V90M60 82V90M71 82V90M80 83V89" stroke="#516165" stroke-width="1.6"/>
 <path d="M31 69L35 74L32 79M93 71L88 76L93 79M34 29L40 32M91 92L96 94" fill="none" stroke="#b2bcb2" stroke-width="1.4"/>
</g>'''
art['chomp']='''
<g stroke-linejoin="round">
 <g fill="none" stroke="#243440" stroke-width="7"><ellipse cx="12" cy="104" rx="10" ry="6" transform="rotate(-25 12 104)"/><ellipse cx="29" cy="98" rx="10" ry="6" transform="rotate(-25 29 98)"/><ellipse cx="43" cy="88" rx="10" ry="6" transform="rotate(-35 43 88)"/></g>
 <g fill="none" stroke="#9ba8ab" stroke-width="3.4"><ellipse cx="12" cy="104" rx="10" ry="6" transform="rotate(-25 12 104)"/><ellipse cx="29" cy="98" rx="10" ry="6" transform="rotate(-25 29 98)"/><ellipse cx="43" cy="88" rx="10" ry="6" transform="rotate(-35 43 88)"/></g>
 <circle cx="71" cy="61" r="47" fill="url(#iron)" stroke="#071423" stroke-width="2.5"/>
 <path d="M116 42L64 67L113 88Q126 65 116 42Z" fill="#400e18" stroke="#080f1c" stroke-width="2"/>
 <path d="M116 44L104 65L102 52L89 70L89 58L74 73L68 67Z" fill="url(#lip)" stroke="#acb2a4" stroke-width=".8"/>
 <path d="M69 70L79 74L87 67L89 79L98 73L100 83L109 77L112 87Z" fill="url(#lip)" stroke="#acb2a4" stroke-width=".8"/>
 <ellipse cx="79" cy="35" rx="10" ry="16" fill="#fff9e7" transform="rotate(-8 79 35)"/>
 <ellipse cx="83" cy="36" rx="4" ry="9" fill="#112433"/><ellipse cx="82" cy="32" rx="1.5" ry="3" fill="white"/>
 <path d="M37 44Q43 28 58 24" stroke="#b5cedc" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>
 <path d="M42 84Q57 102 81 102" stroke="#42627b" stroke-width="2" fill="none"/>
</g>'''
art['plant']='''
<g stroke-linejoin="round" stroke-linecap="round">
 <path d="M62 119Q65 97 57 76Q53 64 61 53" stroke="#285b2d" stroke-width="12" fill="none"/><path d="M59 118Q63 95 55 77" stroke="#78b847" stroke-width="6" fill="none"/>
 <path d="M58 107Q25 111 15 85Q44 80 58 107Z" fill="url(#leaf)" stroke="#285b2d" stroke-width="2"/>
 <path d="M62 97Q75 68 108 78Q106 103 62 105Z" fill="url(#leaf)" stroke="#285b2d" stroke-width="2"/>
 <path d="M25 91Q42 99 57 107M67 99Q83 86 99 83" fill="none" stroke="#b3d06a" stroke-width="1.4"/>
 <path d="M101 23Q83-1 56 8Q20 13 20 44Q21 71 47 79Q73 85 98 62L57 48Z" fill="url(#red)" stroke="#73222b" stroke-width="2.3"/>
 <path d="M101 23L58 47L98 62Q83 71 66 65L46 49Q62 25 101 23Z" fill="#561922" stroke="#862530" stroke-width="2"/>
 <path d="M102 23Q79 31 55 48" fill="none" stroke="#b6bfa6" stroke-width="13"/>
 <path d="M101 21Q79 29 55 46" fill="none" stroke="url(#lip)" stroke-width="10"/>
 <path d="M56 49Q77 60 98 62" fill="none" stroke="#b6bfa6" stroke-width="13"/>
 <path d="M56 47Q77 58 98 60" fill="none" stroke="url(#lip)" stroke-width="10"/>
 <path d="M89 29L87 41L79 34M74 38L74 49L65 43M69 55L76 47L80 58M85 60L93 50L94 61" fill="#fff7e3" stroke="#c5c7b1" stroke-width=".7"/>
 <g fill="#fff5db"><ellipse cx="37" cy="34" rx="8" ry="10" transform="rotate(20 37 34)"/><ellipse cx="59" cy="18" rx="9" ry="6" transform="rotate(-13 59 18)"/><ellipse cx="43" cy="64" rx="7" ry="6" transform="rotate(25 43 64)"/><ellipse cx="70" cy="73" rx="6" ry="3" transform="rotate(-14 70 73)"/></g>
 <path d="M30 25Q38 16 46 15" stroke="#ffad8a" stroke-width="2" fill="none"/>
</g>'''
art['note']='''
<g stroke="#766d61" stroke-width="1.7" stroke-linejoin="round">
 <path d="M17 21L99 13L114 30V110L32 119L17 103Z" fill="#bdc4ba"/>
 <path d="M17 21L99 13L114 30L32 38Z" fill="#fffdf1"/>
 <path d="M32 38L114 30V110L32 119Z" fill="url(#lip)"/>
 <path d="M17 21L32 38V119L17 103Z" fill="#aebfb5"/>
 <path d="M37 42L109 35V105L37 114Z" fill="none" stroke="#fffdf0" stroke-width="2"/>
 <path d="M80 50V89Q75 101 62 99Q51 97 56 88Q62 81 72 85V54Z" fill="#292c30" stroke="none"/>
 <path d="M78 50Q82 61 94 64V74Q81 73 76 64Z" fill="#292c30" stroke="none"/>
 <path d="M43 44L51 43M103 37L108 37M39 108L44 108" stroke="#c4bfa7" stroke-width="1"/>
</g>'''
art['barrel']='''
<g stroke-linejoin="round">
 <path d="M27 16Q64 5 101 16Q121 65 101 111Q66 124 27 111Q8 64 27 16Z" fill="url(#wood)" stroke="#4b2f1e" stroke-width="2.5"/>
 <path d="M41 15Q29 65 40 115M59 12Q54 65 59 119M78 12Q88 66 79 118M96 18Q109 67 96 110" fill="none" stroke="#5b381f" stroke-width="2"/>
 <path d="M44 25Q37 54 44 75M63 22L63 69M82 32Q90 51 86 68M30 78L35 100M70 87L70 112" stroke="#e0a969" stroke-width="1.1" fill="none"/>
 <ellipse cx="64" cy="17" rx="37" ry="12" fill="#d6aa67" stroke="#624323" stroke-width="2"/><ellipse cx="64" cy="17" rx="29" ry="7" fill="#885c31" stroke="#52351f" stroke-width="1.4"/>
 <path d="M45 12L44 20M63 10V24M82 12L83 20" stroke="#bd8e4c" stroke-width="1.4"/>
 <path d="M20 33Q64 47 108 33L112 45Q64 59 16 45Z" fill="url(#metal)" stroke="#47574a" stroke-width="2"/>
 <path d="M18 87Q64 101 110 87L106 101Q64 116 23 101Z" fill="url(#metal)" stroke="#47574a" stroke-width="2"/>
 <path d="M23 35Q63 48 107 35M22 89Q64 103 108 89" fill="none" stroke="#e2dfb2" stroke-width="1.3"/>
 <g fill="#3f5146"><circle cx="31" cy="42" r="2"/><circle cx="65" cy="48" r="2"/><circle cx="99" cy="42" r="2"/><circle cx="32" cy="97" r="2"/><circle cx="66" cy="104" r="2"/><circle cx="98" cy="97" r="2"/></g>
</g>'''
art['klaptrap']='''
<g stroke="#193d62" stroke-width="2" stroke-linejoin="round">
 <path d="M35 80L10 73L3 56L27 62L37 53L41 65L49 50L56 63L69 59L88 63L99 79L89 97L59 102L42 96L31 107L17 103L27 90Z" fill="url(#blue)"/>
 <path d="M52 63Q51 44 62 41Q73 40 76 58Q77 40 88 42Q99 44 97 63" fill="url(#blue)"/>
 <ellipse cx="65" cy="55" rx="8" ry="12" fill="#fff4d3"/><ellipse cx="87" cy="55" rx="8" ry="12" fill="#fff4d3"/><ellipse cx="68" cy="56" rx="3" ry="7" fill="#192f43"/><ellipse cx="90" cy="56" rx="3" ry="7" fill="#192f43"/>
 <path d="M66 67Q90 59 117 67L123 77L114 91L71 90L61 82Z" fill="#32567e"/>
 <path d="M69 68Q95 63 117 69L110 78L101 70L95 80L86 71L79 80Z" fill="#fff6d8" stroke="#c4cebe" stroke-width=".8"/>
 <path d="M65 83L75 76L82 87L91 79L99 87L107 79L116 83L113 95L75 96Z" fill="#f7eac6" stroke="#bdcaba" stroke-width=".8"/>
 <path d="M43 91L53 95L49 108L37 109L35 103M84 96L92 98L90 109L76 108L78 102" fill="#4276ad"/>
 <path d="M20 66L16 57L29 62L34 54L40 65L48 57L55 65" fill="#e3bd58" stroke="#84703c" stroke-width="1"/>
 <path d="M107 67L111 70" stroke="#172d44" stroke-width="2.5"/>
</g>'''
art['bubble']='''
<path d="M67 7Q49 34 76 30Q92 40 81 52Q108 42 110 70Q119 99 89 116Q49 135 23 105Q4 84 25 56Q22 77 40 64Q31 40 67 7Z" fill="url(#fire)" stroke="#ad4a28" stroke-width="1.5"/>
<path d="M31 91Q44 103 43 80Q55 69 55 92Q71 105 79 85Q94 77 96 93Q88 118 62 118Q41 115 31 101Z" fill="#ffe88a" opacity=".6"/>
<ellipse cx="53" cy="84" rx="8" ry="14" fill="#fffce9"/><ellipse cx="78" cy="82" rx="8" ry="14" fill="#fffce9"/><ellipse cx="56" cy="86" rx="3.6" ry="9" fill="#303039"/><ellipse cx="80" cy="84" rx="3.6" ry="9" fill="#303039"/>
'''
art['star']='''
<path d="M64 9L81 43L119 48L91 76L97 116L63 97L29 116L35 76L7 48L46 43Z" fill="#b17b1b" stroke="#7c571b" stroke-width="2" stroke-linejoin="round"/>
<path d="M63 5L80 39L118 44L90 72L96 111L63 92L28 111L34 72L6 44L45 39Z" fill="url(#gold)" stroke="#e9be40" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M15 47L48 43L63 14L65 58Z" fill="#fff8b5" opacity=".45"/>
<ellipse cx="52" cy="62" rx="4.4" ry="12" fill="#443923"/><ellipse cx="76" cy="62" rx="4.4" ry="12" fill="#443923"/><ellipse cx="51" cy="58" rx="1.3" ry="4" fill="#fdf3bb"/><ellipse cx="75" cy="58" rx="1.3" ry="4" fill="#fdf3bb"/>
'''
art['ball']='''<circle cx="64" cy="64" r="47" fill="url(#lip)" stroke="#b9b99b" stroke-width="2"/><path d="M32 27Q75 64 32 101M96 27Q53 64 96 101" stroke="#b94338" stroke-width="2" fill="none"/><g stroke="#b94338" stroke-width="2.2" stroke-linecap="round">'''+''.join(f'<path d="M{x-4} {y-2}l8 4M{128-x-4} {y+2}l8-4"/>' for x,y in [(38,34),(44,44),(48,54),(49,64),(48,74),(44,84),(38,94)])+'</g>'
for name,body in art.items():
 (out/f'{name}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'+DEFS+body+'</svg>')
# Secondary hazards add the park's actual variety, rather than duplicating a stamp.
(out/'plant-yellow.svg').write_text((out/'plant.svg').read_text().replace('url(#red)','url(#gold)').replace('#73222b','#806124').replace('#561922','#5e3920').replace('#862530','#9f692d'))
(out/'brick.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="brick" x2=".8" y2="1"><stop stop-color="#dc9a58"/><stop offset="1" stop-color="#a95b35"/></linearGradient></defs><g stroke="#5d3b2a" stroke-width="2.3" stroke-linejoin="round"><path d="M17 25L100 14L114 30V111L31 122L17 106Z" fill="#875032"/><path d="M17 25L100 14L114 30L31 41Z" fill="#e4ad6d"/><path d="M31 41L114 30V111L31 122Z" fill="url(#brick)"/><path d="M32 67L113 56M32 94L113 83M71 36V62M51 65V91M91 59V85M72 89V116" fill="none"/><path d="M34 44L110 34M35 70L110 60M35 97L110 87" stroke="#f6c284" stroke-width="1.2"/><path d="M21 32V104" stroke="#c58a50" stroke-width="1.3"/></g></svg>''')
(out/'sandstorm.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M16 28Q55 6 108 22L88 43L81 65L65 101L56 119L46 105L47 88L34 61Z" fill="#ead398" opacity=".24"/><g fill="none" stroke-linecap="round"><path d="M19 26C49 10 109 15 111 26S29 45 18 30M25 48C51 35 95 39 98 48S46 63 33 55M38 72C55 61 80 62 81 70S53 81 47 77M49 92Q62 84 69 88T59 99M55 107Q63 103 62 108" stroke="#f6e7bc" stroke-width="4"/><path d="M14 37Q59 47 103 31M35 62Q72 70 87 56M48 84Q65 88 74 80" stroke="#9d7b40" stroke-width="2"/></g><g fill="#e8d499"><circle cx="15" cy="13" r="2"/><circle cx="112" cy="40" r="2"/><circle cx="30" cy="80" r="1.8"/><circle cx="76" cy="110" r="1.5"/></g></svg>''')
