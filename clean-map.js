/* Licensed label-free basemap; Kakao remains the place search and directions provider. */
(() => {
  let basemapKey = null;
  const km = window.kakao?.maps;
  if (!km) return;
  const ll = p => [p.getLng(),p.getLat()];
  const kp = p => new km.LatLng(p.lat,p.lng);
  const events = {
    addListener(o,name,fn) { if(o.on) o.on(name,fn); else km.event.addListener(o,name,fn); },
    removeListener(o,name,fn) { if(o.off) o.off(name,fn); else if(name && fn) km.event.removeListener(o,name,fn); }
  };
  class MapView {
    constructor(container,options) {
      this.raw = new maplibregl.Map({container,center:ll(options.center),zoom:20-options.level,
        maxBounds:[[126.905,37.543],[126.939,37.572]],minZoom:14,maxZoom:19,
        dragRotate:false,touchPitch:false,renderWorldCopies:false,
        attributionControl:{compact:false},
        style:{version:8,sources:{district:{type:'raster',tiles:[`https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png?key=${encodeURIComponent(basemapKey)}`],tileSize:256,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a> © <a href="https://carto.com/attributions" target="_blank">CARTO</a>'}},layers:[{id:'background',type:'raster',source:'district',paint:{'raster-saturation':.15}}]}});
      this.raw.touchZoomRotate.disableRotation();
      this.listeners = new globalThis.Map();
      this.raw.on('error', e => console.warn('Hongdae map data:', e.error?.message));
      new ResizeObserver(() => this.raw.resize()).observe(container);
    }
    getCenter(){return kp(this.raw.getCenter())}
    setCenter(p){this.raw.jumpTo({center:ll(p)})}
    panTo(p){this.raw.easeTo({center:ll(p),duration:350})}
    getLevel(){return Math.round(20-this.raw.getZoom())}
    setLevel(n){this.raw.jumpTo({zoom:20-n})}
    setMinLevel(n){this.raw.setMaxZoom(20-n)}
    setMaxLevel(n){this.raw.setMinZoom(20-n)}
    getBounds(){const b=this.raw.getBounds(); return new km.LatLngBounds(kp(b.getSouthWest()),kp(b.getNorthEast()))}
    setBounds(b){this.raw.fitBounds([ll(b.getSouthWest()),ll(b.getNorthEast())],{padding:45,duration:0})}
    getProjection(){return {containerPointFromCoords:p=>this.raw.project(ll(p))}}
    relayout(){this.raw.resize()}
    on(name,fn){const event=({idle:'moveend',zoom_changed:'zoomend',bounds_changed:'moveend',center_changed:'moveend'})[name]||name;
      const handler=e=>fn(e.lngLat?{latLng:kp(e.lngLat)}:e);this.listeners.set(fn,{event,handler});this.raw.on(event,handler);}
    off(name,fn){const entry=this.listeners.get(fn);if(entry){this.raw.off(entry.event,entry.handler);this.listeners.delete(fn)}}
  }
  class MarkerImage {constructor(src,size,options){this.src=src;this.size=size;this.options=options}}
  class Marker {
    constructor(o={}) {this.position=o.position;this.el=document.createElement('button');this.el.type='button';this.el.className='hm-place-pin';this.el.title=o.title||'';this.el.setAttribute('aria-label',o.title||'지도 장소');
      if(o.image){const img=document.createElement('img');img.src=o.image.src;img.width=o.image.size.width;img.height=o.image.size.height;img.alt='';this.el.append(img)}
      else this.el.textContent='📍';this.el.style.zIndex=o.zIndex||1;
      // Keep pin taps from starting a map gesture or reaching the map click handler.
      for(const name of ['pointerdown','mousedown','touchstart','click']) this.el.addEventListener(name,e=>e.stopPropagation());
      this.raw=new maplibregl.Marker({element:this.el}).setLngLat(ll(this.position));if(o.map)this.setMap(o.map);}
    setMap(map){this.map=map;if(map)this.raw.addTo(map.raw);else this.raw.remove()}
    getPosition(){return this.position}
    setPosition(p){this.position=p;this.raw.setLngLat(ll(p))}
    on(name,fn){this.el.addEventListener(name,fn)}
    off(name,fn){if(name&&fn)this.el.removeEventListener(name,fn)}
  }
  class Overlay {
    constructor(o={}){this.position=o.position;this.el=document.createElement('div');this.el.className='hm-overlay';this.el.style.pointerEvents='none';this.el.style.zIndex=o.zIndex||8;
      if(typeof o.content==='string')this.el.innerHTML=o.content;else if(o.content)this.el.append(o.content);
      this.raw=new maplibregl.Marker({element:this.el,anchor:o.xAnchor<0?'left':o.yAnchor>1?'bottom':'center',offset:o.yAnchor>1?[0,-22]:o.xAnchor<0?[8,0]:[0,0]}).setLngLat(ll(this.position));if(o.map)this.setMap(o.map);}
    setMap(map){this.map=map;if(map)this.raw.addTo(map.raw);else this.raw.remove()}
    getPosition(){return this.position}
    setPosition(p){this.position=p;this.raw.setLngLat(ll(p))}
  }
  class Clusterer {
    constructor(o){this.map=o.map;this.items=[];this.clusters=[];this.minLevel=o.minLevel||3;this.map.on('idle',()=>this.refresh())}
    clear(){this.items.forEach(m=>m.setMap(null));this.clusters.forEach(m=>m.setMap(null));this.items=[];this.clusters=[]}
    addMarkers(items){this.items.push(...items);this.refresh()}
    refresh(){this.clusters.forEach(m=>m.setMap(null));this.clusters=[];const groups=[];const projection=this.map.getProjection();
      this.items.forEach(m=>{m.setMap(null);const p=projection.containerPointFromCoords(m.position);const g=this.map.getLevel()>=this.minLevel&&groups.find(g=>Math.hypot(g.p.x-p.x,g.p.y-p.y)<52);if(g)g.items.push(m);else groups.push({p,items:[m]})});
      groups.forEach(g=>{if(g.items.length<3)g.items.forEach(m=>m.setMap(this.map));else{const m=new Marker({position:g.items[0].position,title:`업체 ${g.items.length}곳`});m.el.classList.add('hm-cluster');m.el.textContent=g.items.length;m.on('click',()=>{this.map.setCenter(m.position);this.map.setLevel(Math.max(1,this.map.getLevel()-1))});m.setMap(this.map);this.clusters.push(m)}});
    }
  }
  class InfoWindow {constructor(o){this.content=o.content}open(map,marker){this.popup=new maplibregl.Popup().setLngLat(ll(marker.position)).setHTML(this.content).addTo(map.raw)}close(){this.popup?.remove()}}
  let lineId=0;
  class Polyline {constructor(o){this.options=o;this.id=`hm-course-${++lineId}`;if(o.map)this.setMap(o.map)}setMap(map){if(this.map){if(this.map.raw.getLayer(this.id))this.map.raw.removeLayer(this.id);if(this.map.raw.getSource(this.id))this.map.raw.removeSource(this.id)}this.map=map;if(!map)return;const add=()=>{if(this.map!==map)return;map.raw.addSource(this.id,{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:this.options.path.map(ll)}}});map.raw.addLayer({id:this.id,type:'line',source:this.id,paint:{'line-color':this.options.strokeColor||'#e8362a','line-width':this.options.strokeWeight||4,'line-opacity':this.options.strokeOpacity||.8}})};if(map.raw.isStyleLoaded())add();else map.raw.once('load',add)}}
  // Default remains Kakao until a licensed, configured background is available.
  window.HongdaeMap = { ready:async () => {
    Object.assign(window.HongdaeMap,km);
    try {
      const res = await fetch('/api/map-config', {signal:AbortSignal.timeout(5000)});
      const config = await res.json();
      if (!config.cartoKey || !window.maplibregl) return;
      basemapKey = config.cartoKey;
      Object.assign(window.HongdaeMap,{Map:MapView,Marker,MarkerImage,CustomOverlay:Overlay,MarkerClusterer:Clusterer,InfoWindow,Polyline,event:events});
    } catch { /* Keep the working Kakao map if config or the new renderer cannot load. */ }
  }};
})();
