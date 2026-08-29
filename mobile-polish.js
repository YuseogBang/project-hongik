(() => {
  function setup() {
    const bar = document.querySelector('.category-bar');
    if (bar && !document.querySelector('#chip-language')) {
      const lang = document.createElement('button'); lang.id='chip-language'; lang.className='chip chip-language';
      lang.innerHTML='<span aria-hidden="true">◎</span><span>언어</span>'; lang.onclick=cycleLang; bar.append(lang);
    }
    const trivia=document.querySelector('#trivia-card'), sidebarTop=document.querySelector('.sidebar-top');
    if(trivia && sidebarTop) sidebarTop.append(trivia);
  }
  document.addEventListener('DOMContentLoaded',setup);
})();
