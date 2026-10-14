/* Dicestack88 Liquid Glass — shape-aware displacement refraction.
   Chromium uses per-surface displacement maps; other browsers get the glass fallback. */
(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const isChromium = navigator.userAgent.includes('Chrome/') && !navigator.userAgent.includes('Edg/') && !navigator.userAgent.includes('OPR/');
  const selectors = [
    '.navbar','body > nav','.glass-card','.card','.card1','.card2','.card3','.card4',
    '.experience-panel','.feature-card','.theme-toggle','.btn','.panel',
    '.youtube-embed-panel','.video-error','.video-card','.filter-btn','.yt-card',
    '.split-card','.player-box','.cta-inner','.stat','.hero-badge','.tag','.status',
    '.social-card','.resource-card','.client-card','.wide-card','.about-section',
    '.channel-link','.footer','footer','.hero-stats > div'
  ].join(',');
  const root = document.createElementNS(svgNS, 'svg');
  root.setAttribute('aria-hidden','true');
  root.setAttribute('focusable','false');
  root.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs = document.createElementNS(svgNS,'defs');
  root.appendChild(defs);
  document.body.prepend(root);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  let serial=0;
  const instances=[];
  function roundedRectDistance(x,y,w,h,r) {
    const dx=Math.abs(x-w/2)-(w/2-r);
    const dy=Math.abs(y-h/2)-(h/2-r);
    return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;
  }
  function createMap(w,h,r,pad,bevel) {
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.ceil(w+pad*2));
    canvas.height=Math.max(1,Math.ceil(h+pad*2));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const img=ctx.createImageData(canvas.width,canvas.height);
    const data=img.data;
    for(let i=0;i<data.length;i+=4){data[i]=128;data[i+1]=128;data[i+2]=128;data[i+3]=255;}
    for(let py=0;py<h;py++){
      for(let px=0;px<w;px++){
        const x=px+0.5,y=py+0.5;
        const sd=roundedRectDistance(x,y,w,h,r);
        if(sd>0 || sd < -bevel) continue;
        const depth=clamp(-sd/bevel,0,1);
        const strength=Math.pow(1-depth,0.78);
        const dx=x-w/2,dy=y-h/2;
        const qx=Math.abs(dx)-(w/2-r),qy=Math.abs(dy)-(h/2-r);
        let nx=0,ny=0;
        if(qx>0 && qy>0){
          const len=Math.hypot(qx,qy)||1;
          nx=Math.sign(dx)*qx/len; ny=Math.sign(dy)*qy/len;
        } else if(qx>qy) nx=Math.sign(dx);
        else ny=Math.sign(dy);
        const i=((py+pad)*canvas.width+(px+pad))*4;
        data[i]=clamp(Math.round(128+nx*57*strength),0,255);
        data[i+1]=128;
        data[i+2]=clamp(Math.round(128+ny*57*strength),0,255);
      }
    }
    ctx.putImageData(img,0,0);
    return canvas.toDataURL('image/png');
  }
  function buildFilter(el) {
    const id='lg-lens-'+(++serial);
    const filter=document.createElementNS(svgNS,'filter');
    filter.setAttribute('id',id);
    filter.setAttribute('color-interpolation-filters','sRGB');
    filter.setAttribute('x','-30%');filter.setAttribute('y','-30%');
    filter.setAttribute('width','160%');filter.setAttribute('height','160%');
    const image=document.createElementNS(svgNS,'feImage');
    image.setAttribute('result','lensMap');
    image.setAttribute('preserveAspectRatio','none');
    const passes=[
      {name:'red',scale:-88,matrix:'1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'},
      {name:'green',scale:-80,matrix:'0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'},
      {name:'blue',scale:-72,matrix:'0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'}
    ];
    const colors=[];
    passes.forEach(p=>{
      const disp=document.createElementNS(svgNS,'feDisplacementMap');
      disp.setAttribute('in','SourceGraphic');disp.setAttribute('in2','lensMap');
      disp.setAttribute('scale',String(p.scale));
      disp.setAttribute('xChannelSelector','R');disp.setAttribute('yChannelSelector','B');
      disp.setAttribute('result',p.name+'Disp');filter.appendChild(disp);
      const matrix=document.createElementNS(svgNS,'feColorMatrix');
      matrix.setAttribute('in',p.name+'Disp');matrix.setAttribute('type','matrix');
      matrix.setAttribute('values',p.matrix);matrix.setAttribute('result',p.name+'Only');
      filter.appendChild(matrix);colors.push(p.name+'Only');
    });
    const blend1=document.createElementNS(svgNS,'feBlend');
    blend1.setAttribute('in',colors[0]);blend1.setAttribute('in2',colors[1]);
    blend1.setAttribute('mode','screen');blend1.setAttribute('result','redGreen');
    const blend2=document.createElementNS(svgNS,'feBlend');
    blend2.setAttribute('in','redGreen');blend2.setAttribute('in2',colors[2]);
    blend2.setAttribute('mode','screen');blend2.setAttribute('result','lensOutput');
    filter.insertBefore(image,filter.firstChild);
    filter.append(blend1,blend2);defs.appendChild(filter);
    const instance={el,id,filter,image,w:0,h:0};
    instances.push(instance);update(instance,true);
    return instance;
  }
  function update(instance,force=false) {
    const el=instance.el;
    if(!el.isConnected)return;
    const rect=el.getBoundingClientRect();
    const w=Math.round(rect.width),h=Math.round(rect.height);
    if(w<12||h<12)return;
    if(!force && w===instance.w && h===instance.h)return;
    instance.w=w;instance.h=h;
    const style=getComputedStyle(el);
    let rv=parseFloat(style.borderTopLeftRadius)||18;
    if(style.borderTopLeftRadius.includes('%'))rv=Math.min(w,h)*rv/100;
    const radius=clamp(rv,4,Math.min(w,h)/2);
    const pad=24,bevel=clamp(Math.min(w,h)*0.22,10,26);
    const uri=createMap(w,h,radius,pad,bevel);
    const px=pad/w*100,py=pad/h*100;
    instance.filter.setAttribute('x',-px+'%');instance.filter.setAttribute('y',-py+'%');
    instance.filter.setAttribute('width',(100+px*2)+'%');instance.filter.setAttribute('height',(100+py*2)+'%');
    instance.image.setAttribute('x',-px+'%');instance.image.setAttribute('y',-py+'%');
    instance.image.setAttribute('width',(100+px*2)+'%');instance.image.setAttribute('height',(100+py*2)+'%');
    instance.image.setAttributeNS(XLINK,'xlink:href',uri);instance.image.setAttribute('href',uri);
    const blur=document.body.classList.contains('light-mode')?'blur(0.35px) saturate(1.2)':'blur(0.45px) saturate(1.55)';
    el.style.setProperty('backdrop-filter','url(#'+instance.id+') '+blur,'important');
    el.style.setProperty('-webkit-backdrop-filter','url(#'+instance.id+') '+blur,'important');
  }
  function init() {
    document.querySelectorAll(selectors).forEach(el=>{
      if(el.dataset.lgRefractionReady)return;
      el.dataset.lgRefractionReady='1';el.classList.add('lg-surface');
      if(isChromium)buildFilter(el);
    });
    if(isChromium)document.documentElement.classList.add('lg-refraction-supported');
  }
  if(!isChromium) {
    document.documentElement.classList.add('lg-refraction-fallback');init();return;
  }
  init();
  let raf=0;
  const refresh=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>instances.forEach(x=>update(x)));};
  const observer=new ResizeObserver(refresh);
  document.querySelectorAll(selectors).forEach(el=>observer.observe(el));
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('scroll',refresh,{passive:true});
  const themeObserver=new MutationObserver(()=>instances.forEach(x=>update(x,true)));
  themeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
