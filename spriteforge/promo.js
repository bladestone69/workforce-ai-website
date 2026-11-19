(() => {
    const panel=document.querySelector('#sf-invite'), key='sf-launch-dismissed-v1';
    if(!panel || location.hash)return;
    try{if(Date.now()<Number(localStorage.getItem(key)))return;}catch{}
    const close=()=>{panel.hidden=true;try{localStorage.setItem(key,String(Date.now()+30*86400000));}catch{}};
    setTimeout(()=>{if(!location.hash&&!document.querySelector('dialog[open]')&&document.activeElement===document.body)panel.hidden=false;},5500);
    document.querySelector('#sf-dismiss').addEventListener('click',()=>{close();document.querySelector('.northstar-hero-note + p a')?.focus({preventScroll:true});});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){const focused=panel.contains(document.activeElement);close();if(focused)document.querySelector('.northstar-hero-note + p a')?.focus({preventScroll:true});}});
    for(const link of panel.querySelectorAll('a'))link.addEventListener('click',close);
})();
