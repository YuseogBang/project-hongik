(() => {
  function enrich(target){
    for(const row of window.HONGDAE_EXISTING_RESEARCH||[]){
      const store=target.find(s=>s.id===row.id && (row.kakaoId==null ? !s.kakaoId : String(s.kakaoId)===row.kakaoId));
      if(!store)continue;
      for(const key of ['hours','hoursState','hoursExceptions','temporarilyClosed','locationNeedsCheck','operatingNote','type','category'])if(row[key]!=null)store[key]=row[key];
      if(row.naverUrl)store.naverUrl=row.naverUrl;
      store.existingResearch=row;
      store.surveyMenu={...(store.surveyMenu||{}),kakaoId:row.kakaoId,hours:row.hours,source:row.hoursSource||row.kakaoUrl||row.naverUrl,menuSource:row.menuSource||row.kakaoUrl||row.naverUrl,menu:row.menu||store.surveyMenu?.menu||[]};
    }
  }
  window.HongdaeExistingResearch={enrich};enrich(stores);
})();
