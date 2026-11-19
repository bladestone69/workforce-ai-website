const frames = [...document.querySelectorAll('.screenwall figure')];
const controls = document.querySelector('.switches');
const buttons = frames.map((frame, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = frame.dataset.name;
  button.addEventListener('click', () => select(i));
  controls.append(button);
  return button;
});
function select(i) {
  frames.forEach((frame, j) => {
    frame.hidden = i !== j;
    buttons[j].setAttribute('aria-pressed', String(i === j));
  });
}
select(0);
const form=document.querySelector('#sf-signup');
form.addEventListener('submit', async event=>{
  event.preventDefault();
  const feedback=document.querySelector('#sf-feedback'), button=form.querySelector('button');
  if(button.disabled)return;
  if(!['lockdownstudios.com','www.lockdownstudios.com'].includes(location.hostname)){
    const link=document.createElement('a');link.href='https://www.lockdownstudios.com/spriteforge/studio#preorder';link.textContent='Open the official signup form';
    feedback.replaceChildren('This is a local preview. ',link);return;
  }
  button.disabled=true;feedback.textContent='Saving your signup…';
  try{
    const data=new FormData(form);
    const response=await fetch('/api/save-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enquiryType:'spriteforge',name:data.get('name'),email:data.get('email'),launchConsent:data.has('consent')})});
    const result=await response.json();
    if(!response.ok||result.success!==true)throw new Error();
    form.reset();button.textContent='You’re on the list';feedback.textContent='Your signup was saved. No payment was taken.';
  }catch{button.disabled=false;feedback.textContent='We couldn’t confirm your signup. Please try again later or email info@lockdownstudios.com.';}
});
