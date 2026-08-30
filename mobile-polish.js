(() => {
  function setup() {
    const bar = document.querySelector('.category-bar');
    if (bar && !document.querySelector('#chip-language')) {
      const lang = document.createElement('button'); lang.id='chip-language'; lang.className='chip chip-language';
      lang.innerHTML='<span aria-hidden="true">◎</span><span>언어</span>'; lang.onclick=cycleLang; bar.append(lang);
    }
    // 2026-08-30 버그 수정: trivia-card는 main.html에 이미 .sidebar-top의 첫 번째 항목으로 들어있는데,
    // 예전 코드는 조건 없이 append()를 호출해서 "이미 들어있는 자식을 다시 넣기" = 맨 뒤로 이동시키는 부작용이 있었음
    // (필터 칩 9묶음이 항상 펼쳐져 있어서 상식 카드가 그 밑으로 밀려 스크롤해야 보였던 원인).
    // 이미 올바른 위치(.sidebar-top의 자식)에 있으면 건드리지 않고, 정말 다른 곳에 있을 때만 옮기도록 수정.
    const trivia=document.querySelector('#trivia-card'), sidebarTop=document.querySelector('.sidebar-top');
    if(trivia && sidebarTop && trivia.parentElement !== sidebarTop) sidebarTop.prepend(trivia);
  }
  document.addEventListener('DOMContentLoaded',setup);
})();
