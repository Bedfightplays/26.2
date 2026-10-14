/* Dicestack88 Liquid Glass — performance-conscious lens refraction.
   Expensive SVG displacement is reserved for a few large surfaces; small UI uses CSS glass. */
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
  root.style.cssText='position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs=document.createElementNS(svgNS,'defs'); root.appendChild(defs);
  document.body.prepend(root);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  let serial=0;
  const instances=[];
  function roundedRectDistance(x,y,w,h,r){
    const dx=Math.abs(x-w/2)-(w/2-r),dy=Math.abs(y-h/2)-(h/2-r);
    return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;
  }
  function createMap(w,h,r,pad,bevel){
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.ceil(w+pad*2)); canvas.height=Math.max(1,Math.ceil(h+pad*2));
    const ctx=canvas.getContext('2d',{willReadFrequently:true}), img=ctx.createImageData(canvas.width,canvas.height),data=img.data;
    for(let i=0;i<data.length;i+=4){data[i]=128;data[i+1]=128;data[i+2]=128;data[i+3]=255;}
    for(let py=0;py<h;py++) for(let px=0;px<w;px++){
      const x=px+.5,y=py+.5,sd=roundedRectDistance(x,y,w,h,r);
      if(sd>0||sd< -bevel)continue;
      const depth=clamp(-sd/bevel,0,1),strength=Math.pow(1-depth,.78);
      const dx=x-w/2,dy=y-h/2,qx=Math.abs(dx)-(w/2-r),qy=Math.abs(dy)-(h/2-r);
      let nx=0,ny=0;
      if(qx>0&&qy>0){const len=Math.hypot(qx,qy)||1;nx=Math.sign(dx)*qx/len;ny=Math.sign(dy)*qy/len;}
      else if(qx>qy)nx=Math.sign(dx);else ny=Math.sign(dy);
      const i=((py+pad)*canvas.width+(px+pad))*4;
      data[i]=clamp(Math.round(128+nx*57*strength),0,255);
      data[i+2]=clamp(Math.round(128+ny*57*strength),0,255);
    }
    ctx.putImageData(img,0,0);return canvas.toDataURL('image/png');
  }
  function buildFilter(el){
    const id='lg-lens-'+(++serial),filter=document.createElementNS(svgNS,'filter');
    filter.id=id;filter.setAttribute('color-interpolation-filters','sRGB');
    filter.setAttribute('x','-25%');filter.setAttribute('y','-25%');filter.setAttribute('width','150%');filter.setAttribute('height','150%');
    const image=document.createElementNS(svgNS,'feImage');image.setAttribute('result','lensMap');image.setAttribute('preserveAspectRatio','none');
    const passes=[
      {name:'red',scale:-72,matrix:'1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'},
      {name:'green',scale:-66,matrix:'0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'},
      {name:'blue',scale:-60,matrix:'0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'}
    ],colors=[];
    for(const p of passes){
      const disp=document.createElementNS(svgNS,'feDisplacementMap');
      disp.setAttribute('in','SourceGraphic');disp.setAttribute('in2','lensMap');disp.setAttribute('scale',p.scale);
      disp.setAttribute('xChannelSelector','R');disp.setAttribute('yChannelSelector','B');disp.setAttribute('result',p.name+'Disp');filter.appendChild(disp);
      const matrix=document.createElementNS(svgNS,'feColorMatrix');matrix.setAttribute('in',p.name+'Disp');matrix.setAttribute('type','matrix');
      matrix.setAttribute('values',p.matrix);matrix.setAttribute('result',p.name+'Only');filter.appendChild(matrix);colors.push(p.name+'Only');
    }
    const b1=document.createElementNS(svgNS,'feBlend');b1.setAttribute('in',colors[0]);b1.setAttribute('in2',colors[1]);b1.setAttribute('mode','screen');b1.setAttribute('result','rg');
    const b2=document.createElementNS(svgNS,'feBlend');b2.setAttribute('in','rg');b2.setAttribute('in2',colors[2]);b2.setAttribute('mode','screen');
    filter.insertBefore(image,filter.firstChild);filter.append(b1,b2);defs.appendChild(filter);
    const instance={el,id,filter,image,w:0,h:0};instances.push(instance);update(instance,true);return instance;
  }
  function update(inst,force=false){
    const el=inst.el;if(!el.isConnected)return;
    const rect=el.getBoundingClientRect(),w=Math.round(rect.width),h=Math.round(rect.height);
    if(w<12||h<12||(!force&&w===inst.w&&h===inst.h))return;
    inst.w=w;inst.h=h;
    const style=getComputedStyle(el);let rv=parseFloat(style.borderTopLeftRadius)||18;
    if(style.borderTopLeftRadius.includes('%'))rv=Math.min(w,h)*rv/100;
    const radius=clamp(rv,4,Math.min(w,h)/2),pad=18,bevel=clamp(Math.min(w,h)*.18,9,22);
    const uri=createMap(w,h,radius,pad,bevel),px=pad/w*100,py=pad/h*100;
    inst.filter.setAttribute('x',-px+'%');inst.filter.setAttribute('y',-py+'%');
    inst.filter.setAttribute('width',(100+px*2)+'%');inst.filter.setAttribute('height',(100+py*2)+'%');
    inst.image.setAttribute('x',-px+'%');inst.image.setAttribute('y',-py+'%');
    inst.image.setAttribute('width',(100+px*2)+'%');inst.image.setAttribute('height',(100+py*2)+'%');
    inst.image.setAttributeNS(XLINK,'xlink:href',uri);inst.image.setAttribute('href',uri);
    const blur=document.body.classList.contains('light-mode')?'blur(0.4px) saturate(1.15)':'blur(0.4px) saturate(1.4)';
    el.style.setProperty('backdrop-filter','url(#'+inst.id+') '+blur,'important');
    el.style.setProperty('-webkit-backdrop-filter','url(#'+inst.id+') '+blur,'important');
    el.classList.add('lg-lens-active');
  }
  function init(){
    const all=[...document.querySelectorAll(selectors)];
    all.forEach(el=>el.classList.add('lg-surface'));
    if(!isChromium)return;
    // Limit live displacement to a handful of large, visually important surfaces.
    const candidates=all.filter(el=>{
      const r=el.getBoundingClientRect();
      return r.width>=280&&r.height>=110&&!el.matches('.btn,.theme-toggle,.filter-btn,.tag,.status,.hero-badge,.channel-link,.stat,.hero-stats > div');
    }).sort((a,b)=>{
      const score=el=>{const r=el.getBoundingClientRect();return r.width*r.height;};
      return score(b)-score(a);
    }).slice(0,6);
    // Always prioritize the navigation bar if present.
    const nav=all.find(el=>el.matches('.navbar,body > nav'));
    if(nav&&!candidates.includes(nav)){candidates.pop();candidates.unshift(nav);}
    candidates.forEach(buildFilter);
    document.documentElement.classList.add('lg-refraction-supported');
  }
  init();
  if(!isChromium)return;
  let raf=0;
  const refresh=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
    // No pixel-map regeneration on scroll; maps only rebuild when dimensions change.
    instances.forEach(inst=>update(inst));
  });};
  const observer=new ResizeObserver(refresh);
  instances.forEach(inst=>observer.observe(inst.el));
  window.addEventListener('resize',refresh,{passive:true});
  const themeObserver=new MutationObserver(()=>instances.forEach(inst=>update(inst,true)));
  themeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
})();