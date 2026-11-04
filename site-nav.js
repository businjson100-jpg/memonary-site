document.querySelectorAll('.menu-toggle').forEach(button=>{
  const nav=document.getElementById(button.getAttribute('aria-controls'));
  const close=()=>{button.setAttribute('aria-expanded','false');button.textContent='메뉴 ☰';nav.classList.remove('open');};
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.textContent=open?'닫기 ×':'메뉴 ☰';nav.classList.toggle('open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
});
// Existing legal anchors continue to open their full policy section.
function revealPolicyAnchor(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  let ancestor=target.parentElement;while(ancestor){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}
  if(location.hash)target.scrollIntoView({block:'start'});
}
window.addEventListener('hashchange',revealPolicyAnchor);revealPolicyAnchor();
