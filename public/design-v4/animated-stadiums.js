(() => {
  const frame=document.querySelector('.stadium-motion-frame');
  if(!frame)return;
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type==='rio-stadium-study-height'&&Number.isFinite(event.data.height)){
      frame.style.height=Math.min(2400,Math.max(700,event.data.height+12))+'px';
    }
  });
})();
