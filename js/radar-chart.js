(function(){
  const canvas=document.getElementById('radar-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=420,H=420,CX=210,CY=210,R=160;
  const labels=['ML & DL','GenAI / LLMs','Cloud & MLOps','Data Eng','APIs','Visualization'];
  const values=[.95,.92,.87,.89,.83,.82];
  const colors=['#9b6dff','#00e5ff','#ff3cac','#ffb700','#00ff9f','#c8b4ff'];
  const N=labels.length;
  let prog=0,started=false;

  function getPoint(i,r){
    const ang=(i/N)*Math.PI*2-Math.PI/2;
    return{x:CX+Math.cos(ang)*r,y:CY+Math.sin(ang)*r};
  }

  function draw(p){
    ctx.clearRect(0,0,W,H);
    for(let ring=1;ring<=5;ring++){
      ctx.beginPath();
      for(let i=0;i<N;i++){const pt=getPoint(i,R*(ring/5));i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y);}
      ctx.closePath();
      ctx.strokeStyle=`rgba(108,47,255,${ring===5?.2:.08})`;ctx.lineWidth=1;ctx.stroke();
    }
    for(let i=0;i<N;i++){
      const pt=getPoint(i,R);
      ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(pt.x,pt.y);
      ctx.strokeStyle='rgba(108,47,255,.12)';ctx.lineWidth=1;ctx.stroke();
    }
    ctx.beginPath();
    for(let i=0;i<N;i++){const pt=getPoint(i,R*values[i]*p);i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y);}
    ctx.closePath();
    ctx.fillStyle='rgba(108,47,255,.12)';ctx.fill();
    ctx.strokeStyle='rgba(155,109,255,.7)';ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<N;i++){
      const pt=getPoint(i,R*values[i]*p);
      ctx.beginPath();ctx.arc(pt.x,pt.y,5,0,Math.PI*2);
      ctx.fillStyle=colors[i];ctx.fill();
      ctx.beginPath();ctx.arc(pt.x,pt.y,8,0,Math.PI*2);
      ctx.fillStyle=colors[i]+'33';ctx.fill();
    }
    ctx.font=`500 11px 'Space Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
    for(let i=0;i<N;i++){
      const pt=getPoint(i,R+24);
      ctx.fillStyle=colors[i];ctx.fillText(labels[i],pt.x,pt.y);
    }
  }

  const ioR=new IntersectionObserver(en=>{
    if(en[0].isIntersecting&&!started){
      started=true;
      function anim(){prog=Math.min(prog+.022,1);draw(prog);if(prog<1)requestAnimationFrame(anim);}
      requestAnimationFrame(anim);
      ioR.disconnect();
    }
  },{threshold:.3});
  ioR.observe(canvas);
  draw(0);
})();