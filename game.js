'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const W=960,H=820,grid={x:294,y:290,size:124};
let world='forest',worlds={},portalUnlocked=false,dragPoint=null;
let state,selected=-1,cursor=4,keyboard=false,drag=-1,paused=false,last=0,previousPad=[],stickTime=0;
function reset(){state={coins:100,cost:50,recruits:0,units:Array(9).fill(null),zombies:[],arrows:[],effects:[],spawn:spawnInterval(0),kills:0,progress:0,waves:0,bossActive:false,lives:5,time:0};selected=-1;drag=-1;dragPoint=null;paused=false;spawnZombie();$('overlay').hidden=true;$('travel').hidden=true;$('pause').textContent='Ⅱ';message('Recruit a slime to protect your camp.');sync();}
function openPortal(){if(!state.lives)return;paused=true;drag=-1;dragPoint=null;$('overlay').hidden=false;$('overlay-title').textContent=world==='moon'?'Return to the forest?':'The Moon portal';$('overlay-text').textContent=world==='moon'?'Your forest crew is waiting exactly where you left it. Your Moon progress will stay here.':portalUnlocked?'Travel to a Moon outpost with aliens and futuristic slimes. Your first visit starts with 100 coins and an empty grid. Your forest progress stays safe.':`Defeat ${100-state.kills} more zombies to unlock the Moon (${state.kills}/100).`;$('travel').hidden=!portalUnlocked;$('travel').textContent=world==='moon'?'Return to forest →':'Travel to the Moon →';$('resume').textContent='Keep playing';$('pause').textContent='▶';sync();}
function travel(){if(!portalUnlocked)return;worlds[world]=state;world=world==='forest'?'moon':'forest';if(worlds[world])state=worlds[world];else reset();selected=-1;drag=-1;dragPoint=null;paused=false;$('overlay').hidden=true;$('travel').hidden=true;$('pause').textContent='Ⅱ';document.body.classList.toggle('moon',world==='moon');message(world==='moon'?'Moon outpost · Merge space slimes to fight the aliens!':'Welcome back! Your forest crew is just as you left it.');sync();}
function stats(level){return{damage:25*2**(level-1),interval:Math.max(.22,1.5*.78**(level-1))};}
function message(t){$('message').textContent=t;}
function sync(){$('outfit-label').textContent=world==='moon'?'LEVEL 1 · SPACE CADET':'LEVEL 1 · CAVEMAN';$('portal').textContent=world==='moon'?'Portal ↩':portalUnlocked?'Portal ✦':`Portal ${Math.min(state.kills,100)}/100`;$('coins').textContent=state.coins;$('cost').textContent=state.cost;$('kills').textContent=state.kills;$('waves').textContent=state.waves;$('progress').textContent=`${state.progress}/20`;$('boss-fill').style.width=`${state.progress*5}%`;$('boss-meter').setAttribute('aria-valuenow',state.progress);$('boss-label').textContent=state.bossActive?'BOSS BATTLE':'BOSS INCOMING';$('lives').textContent='♥ '.repeat(state.lives)+'♡ '.repeat(5-state.lives);$('buy').disabled=state.coins<state.cost||state.units.every(Boolean)||paused;$('wave').textContent=state.bossActive?`${bossNames[state.waves%bossNames.length]} · BOSS`:`NEXT ${state.waves+1} ${world==='moon'?'ALIEN':'ZOMBIE'}${state.waves?'S':''} · ${Math.ceil(state.spawn)}s`;}
function buy(){if(paused||state.lives===0)return;if(state.units.every(Boolean)){message('Camp is full! Merge matching slimes to make room.');return;}if(state.coins<state.cost){message('Defeat zombies to earn 50 coins each.');return;}const i=state.units.indexOf(null);state.coins-=state.cost;state.recruits++;if(state.recruits>1)state.cost+=50;state.units[i]={level:1,cooldown:0,hp:100};burst(center(i).x,center(i).y,'+ SLIME','#deeba7');message('Drag two level 1 slimes together to merge.');sync();}
function center(i){return{x:grid.x+(i%3+.5)*grid.size,y:grid.y+(Math.floor(i/3)+.5)*grid.size};}
function select(i){if(paused||i<0)return;keyboard=true;cursor=i;if(selected===i){selected=-1;return;}if(selected>=0){const a=state.units[selected],b=state.units[i];if(a&&!b){state.units[i]=a;state.units[selected]=null;selected=-1;message('Slime moved.');}else if(a&&b&&a.level===b.level){b.level++;b.cooldown=0;b.hp=100;state.units[selected]=null;selected=-1;const s=stats(b.level);burst(center(i).x,center(i).y,'LEVEL UP!','#e3ef9f');message(`Level ${b.level}: ${s.damage} damage · ${s.interval.toFixed(2)}s fire interval.`);}else{selected=state.units[i]?i:-1;message('Match two slimes of the same level to merge.');}}else{selected=state.units[i]?i:-1;if(selected>=0){const s=stats(state.units[i].level);message(`Level ${state.units[i].level} selected · ${s.damage} damage. Choose a matching slime.`);}}sync();}
function spawnInterval(waves){return Math.max(2.5,5-waves*.5);}
function bossHealth(){return 350+state.waves*100;}
function spawnZombie(){for(let i=0;i<=state.waves;i++){const angle=Math.random()*Math.PI*2,hp=100+state.waves*65;state.zombies.push({x:480+Math.cos(angle)*510,y:475+Math.sin(angle)*470,hp,maxHp:hp,attackCooldown:0,wobble:Math.random()*6});}}
const bossNames=['Horned Ogre','Bone King','Violet Demon','Stone Golem','Forest Dragon'];
function spawnBoss(){state.bossActive=true;const hp=bossHealth();state.zombies.push({x:480,y:115,hp,maxHp:hp,boss:true,kind:state.waves%5,wobble:0});message(`${bossNames[state.waves%5]} approaches! ${hp} health.`);burst(480,220,'BOSS INCOMING','#ffb09b');}
function defeat(z){if(z.boss){state.waves++;state.progress=0;state.bossActive=false;state.spawn=spawnInterval(state.waves);state.coins+=150;burst(z.x,z.y,'BOSS DEFEATED +150','#ffe193');message(`Wave ${state.waves} complete! Next boss: ${bossHealth()} health.`);}else{state.kills++;if(world==='forest'&&state.kills>=100)portalUnlocked=true;state.coins+=50;burst(z.x,z.y,'+50 coins','#efcf78');if(!state.bossActive){state.progress++;if(state.progress===20)spawnBoss();}}window.RunXR?.score(state.kills);}
function burst(x,y,text,color){state.effects.push({x,y,text,color,life:1.4});}
const ogreWindup=2;
function damageSlime(tile,damage){
 const u=state.units[tile];
 if(!u)return;
 const p=center(tile);
 u.hp=Math.max(0,(u.hp??100)-damage);
 burst(p.x,p.y-40,`−${damage} HP`,'#ffb5a2');
 if(u.hp>0)return;
 state.units[tile]=null;
 if(selected===tile)selected=-1;
 if(drag===tile){drag=-1;dragPoint=null;}
 burst(p.x,p.y,'SLIME LOST','#ffc6b0');
 message('A slime fell! Recruit or merge to defend your crew.');
}
function update(dt){if(paused||!state.lives)return;state.time+=dt;if(!state.bossActive){state.spawn-=dt;if(state.spawn<=0){spawnZombie();state.spawn+=spawnInterval(state.waves);}}for(const z of state.zombies){
 if(z.hp<=0)continue;
 let target=-1,nearest=Infinity;
 state.units.forEach((u,i)=>{if(!u)return;const p=center(i),distance=Math.hypot(p.x-z.x,p.y-z.y);if(distance<nearest){nearest=distance;target=i;}});
 const destination=target>=0?center(target):{x:480,y:476};
 const dx=destination.x-z.x,dy=destination.y-z.y,d=Math.hypot(dx,dy);
 z.attackCooldown=Math.max(0,(z.attackCooldown||0)-dt);
 if(z.boss&&z.kind===0){
  if(z.slam){
   z.slam.remaining-=dt;
   if(z.slam.remaining<=0){
    const p=center(z.slam.tile);
    burst(p.x,p.y,'SLAM!','#ffb09b');
    damageSlime(z.slam.tile,45);
    z.slam=null;
    z.attackCooldown=3;
   }
   continue;
  }
  if(target>=0&&z.attackCooldown===0){
   z.slam={tile:target,remaining:ogreWindup};
   message('Ogre slam! Move your slime off the marked tile.');
   continue;
  }
  if(target>=0&&d<48)continue;
 }
 if(target>=0&&d<48){
  if(z.attackCooldown===0){damageSlime(target,z.boss?30:Math.min(25,10+state.waves*3));z.attackCooldown=1;}
 }else if(target<0&&d<130){if(z.boss){state.lives=0;finish();break;}z.hp=0;state.lives--;burst(z.x,z.y,'CAMP HIT','#ffa08e');if(!state.lives){finish();break;}}
 else if(d>0){
  const speed=z.boss?16:Math.min(34,22+state.waves*2);
  z.x+=dx/d*speed*dt;
  z.y+=dy/d*speed*dt;
 }
}
state.zombies=state.zombies.filter(z=>z.hp>0);
state.units.forEach((u,i)=>{if(!u)return;u.cooldown=Math.max(0,u.cooldown-dt);if(u.cooldown>0||!state.zombies.length)return;const p=center(i),target=state.zombies.reduce((a,b)=>Math.hypot(a.x-480,a.y-476)<Math.hypot(b.x-480,b.y-476)?a:b);state.arrows.push({x:p.x,y:p.y-15,target,damage:stats(u.level).damage});u.cooldown=stats(u.level).interval;});
for(const a of state.arrows){if(a.target.hp<=0){a.dead=true;continue;}const dx=a.target.x-a.x,dy=a.target.y-a.y,d=Math.hypot(dx,dy);a.angle=Math.atan2(dy,dx);if(d<550*dt+12){a.dead=true;a.target.hp=Math.max(0,a.target.hp-a.damage);burst(a.target.x,a.target.y-30,`−${a.damage}`,'#fff2b6');if(!a.target.hp){defeat(a.target);}}else{a.x+=dx/d*550*dt;a.y+=dy/d*550*dt;}}
state.arrows=state.arrows.filter(a=>!a.dead);state.zombies=state.zombies.filter(z=>z.hp>0);for(const e of state.effects){e.life-=dt;e.y-=22*dt;}state.effects=state.effects.filter(e=>e.life>0);sync();}
function finish(){paused=true;$('travel').hidden=true;$('overlay-title').textContent='A brave little stand.';$('overlay-text').textContent=`Your crew defeated ${state.kills} zombies. Build a new outpost and try again!`;$('resume').textContent='Build a new outpost →';$('overlay').hidden=false;window.RunXR?.score(state.kills);}
function pause(){if(!state.lives)return;$('travel').hidden=true;paused=!paused;$('overlay').hidden=!paused;$('overlay-title').textContent='Taking a breather.';$('overlay-text').textContent='Your outpost will be here when you’re ready.';$('resume').textContent='Back to camp →';$('pause').textContent=paused?'▶':'Ⅱ';sync();}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function line(x,y,xx,yy,c,width){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();}
function rect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function label(t,x,y,size,color){ctx.font=`600 ${size}px "DM Sans",sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(t,x,y);}
function tree(x,y,s){ellipse(x+10,y+26,s*.72,s*.34,'#142b2355');rect(x-5,y,10,26,3,'#67593c');ellipse(x,y-12,s*.7,s*.77,'#243f2c');ellipse(x-12,y-17,s*.5,s*.56,'#304e32');ellipse(x+7,y-30,s*.48,s*.5,'#3b5838');ellipse(x-7,y-36,s*.27,s*.28,'#48633c');}
function person(x,y,level,zombie=false,phase=0){if(!zombie){slime(x,y,level);return;}if(world==='moon'){alien(x,y,phase);return;}const bob=zombie?Math.sin(state.time*5+phase)*2:Math.sin(state.time*2+x)*1;ctx.save();ctx.translate(x,y+bob);ellipse(1,24,23,10,'#10281d55');line(-9,14,-10,24,zombie?'#3d4540':'#514737',9);line(9,14,11,24,zombie?'#3d4540':'#514737',9);rect(-17,-14,34,34,10,zombie?'#776b65':['#9fae70','#79aa99','#9a90c3','#ceae6a'][(level-1)%4]);line(-19,-6,-23,8,zombie?'#91ac77':'#e4b68a',8);line(19,-6,24,zombie?-16:6,zombie?'#91ac77':'#e4b68a',8);ellipse(0,-24,21,22,zombie?'#a1b885':'#e9bc92');if(zombie){rect(-17,-43,24,9,4,'#536d4c');line(-11,-25,-4,-23,'#354434',3);line(5,-23,12,-25,'#354434',3);line(-5,-12,8,-12,'#536345',3);}else{ctx.fillStyle='#5a4030';ctx.beginPath();ctx.moveTo(-21,-22);ctx.bezierCurveTo(-28,-59,28,-61,21,-23);ctx.lineTo(11,-37);ctx.lineTo(-1,-31);ctx.lineTo(-10,-38);ctx.closePath();ctx.fill();ellipse(-7,-23,2,2.8,'#39362c');ellipse(8,-23,2,2.8,'#39362c');line(-2,-13,4,-13,'#b37c57',2);ctx.strokeStyle='#caa36a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(22,0,25,-1.1,1.1);ctx.stroke();line(33,-22,33,22,'#e3d9b5',1);line(21,1,53,1,'#e7d9b2',2);line(48,-3,53,1,'#e7d9b2',2);line(48,5,53,1,'#e7d9b2',2);rect(-18,34,36,19,6,level>1?'#d2e899':'#31462b');label(`L${level}`,0,48,11,level>1?'#2d4025':'#dde8bb');}ctx.restore();}
function slime(x,y,level){if(world==='moon'){spaceSlime(x,y,level);return;}ctx.save();ctx.translate(x,y);const squash=Math.sin(state.time*3+x)*.035;ctx.scale(1+squash,1-squash);ellipse(0,25,33,12,'#18392366');ellipse(0,0,31,32,`hsl(${110+(level-1)*17%100} 52% 59%)`);ellipse(-14,-16,8,5,'#d9ffbc77');
const cloth=['#a87643','#876647','#7e8fa0','#6eacc0','#dbc06c'][(level-1)%5];
ctx.fillStyle=cloth;ctx.beginPath();ctx.moveTo(-29,4);ctx.lineTo(27,4);ctx.lineTo(30,24);ctx.lineTo(15,20);ctx.lineTo(5,27);ctx.lineTo(-7,21);ctx.lineTo(-25,25);ctx.closePath();ctx.fill();
if(level===1){for(const [a,b] of [[-18,12],[3,17],[17,10]])ellipse(a,b,4,3,'#593e2a');line(-17,-25,20,21,'#a87643',8);line(-17,-26,-4,-29,'#f5e8c7',4);ellipse(-19,-26,3,4,'#f5e8c7');ellipse(-2,-29,3,4,'#f5e8c7');}
else if(level===2){ctx.fillStyle='#795c38';ctx.beginPath();ctx.moveTo(-32,-15);ctx.lineTo(-8,-48);ctx.lineTo(28,-17);ctx.closePath();ctx.fill();line(7,-34,23,-49,'#d6dc9a',4);}
else{rect(-28,-36,56,18,8,cloth);line(0,-39,0,-21,'#e7f2d1',3);rect(-32,2,14,16,5,cloth);rect(19,2,14,16,5,cloth);line(-21,10,20,10,'#d3ddc0',2);if(level>=4){line(0,-38,0,-53,level%2?'#efcc73':'#d67573',8);}if(level>=5){ctx.fillStyle=`hsl(${level*35%360} 70% 65%)`;ctx.beginPath();ctx.moveTo(-23,-34);ctx.lineTo(-26,-51);ctx.lineTo(-12,-44);ctx.lineTo(0,-58);ctx.lineTo(12,-44);ctx.lineTo(26,-51);ctx.lineTo(23,-34);ctx.closePath();ctx.fill();}}
ellipse(-10,-9,4,6,'#203e2b');ellipse(10,-9,4,6,'#203e2b');ellipse(-11,-11,1.4,2,'#fff');ellipse(9,-11,1.4,2,'#fff');line(-3,1,3,1,'#315836',2);ctx.strokeStyle='#d7b275';ctx.lineWidth=4;ctx.beginPath();ctx.arc(22,0,25,-1.1,1.1);ctx.stroke();line(33,-22,33,22,'#f2e3b9',1);line(22,0,52,0,'#f7e9b7',2);line(47,-4,52,0,'#f7e9b7',2);rect(-21,35,42,20,7,'#233f29');label(`L${level}`,0,50,13,'#e9f7bf');ctx.restore();}
function monster(z){ctx.save();ctx.translate(z.x,z.y);const colors=['#9da45c','#d9d2b3','#a67bbb','#879794','#689964'];ellipse(0,35,43,14,'#1a2b2477');const c=colors[z.kind];if(z.kind===4){for(const side of [-1,1]){ctx.fillStyle='#477348';ctx.beginPath();ctx.moveTo(side*20,0);ctx.lineTo(side*70,-40);ctx.lineTo(side*62,23);ctx.closePath();ctx.fill();}}rect(-32,-30,64,68,z.kind===3?8:25,c);ellipse(0,-30,30,27,c);if(z.kind===0||z.kind===2){line(-23,-44,-37,-64,'#ebd6ac',9);line(23,-44,37,-64,'#ebd6ac',9);}if(z.kind===1){rect(-21,-61,42,15,2,'#e3bd5d');for(const x of [-18,0,18])line(x,-60,x,-71,'#e3bd5d',5);ellipse(-12,-31,9,10,'#3d4139');ellipse(12,-31,9,10,'#3d4139');for(const x of [-10,0,10])line(x,-9,x,0,'#555c4b',3);}else{line(-20,-33,-6,-29,'#472d35',5);line(6,-29,20,-33,'#472d35',5);line(-9,-13,9,-13,'#f6dfae',4);}if(z.kind===3){line(-17,5,10,22,'#4f6660',4);rect(-46,-10,18,43,4,c);rect(28,-10,18,43,4,c);}ctx.restore();}
function slimeHealth(x,y,u){const hp=u.hp??100;rect(x-28,y-70,56,7,3,'#25302d');rect(x-27,y-69,54*hp/100,5,2,hp>30?'#98f0a6':'#ff8c80');label(`${hp}/100`,x,y-77,12,'#e8ffdf');}
function alien(x,y,phase){ctx.save();ctx.translate(x,y+Math.sin(state.time*4+phase)*3);ellipse(0,25,24,9,'#10142666');rect(-15,-4,30,30,10,'#626087');ellipse(0,-24,24,29,'#93d8bc');ellipse(-10,-24,7,11,'#21263f');ellipse(10,-24,7,11,'#21263f');line(-19,0,-30,12,'#93d8bc',7);line(19,0,30,12,'#93d8bc',7);line(-8,22,-12,31,'#767293',7);line(8,22,12,31,'#767293',7);line(-9,-46,-16,-57,'#93d8bc',3);line(9,-46,16,-57,'#93d8bc',3);ellipse(-16,-57,4,4,'#e7b7ff');ellipse(16,-57,4,4,'#e7b7ff');ctx.restore();}
function spaceSlime(x,y,level){ctx.save();ctx.translate(x,y+Math.sin(state.time*3+x)*2);const color=`hsl(${185+level*31%170} 75% 72%)`;ellipse(0,25,34,10,'#10142566');ellipse(0,-5,31,34,'#9ce3cd');rect(-28,0,56,26,10,level===1?'#e0e6ef':color);ellipse(0,-17,34,30,'#b7e6fa66');ctx.strokeStyle=level===1?'#e0e6ef':color;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-17,34,30,0,0,Math.PI*2);ctx.stroke();rect(-22,-23,44,17,7,'#263953');ellipse(-9,-15,3,4,'#9affef');ellipse(9,-15,3,4,'#9affef');rect(-11,7,22,10,3,'#34405a');for(let i=0;i<Math.min(level,5);i++)ellipse(-8+i*4,12,1.5,2,'#a5ffff');if(level>=2){rect(-37,0,10,21,4,color);rect(27,0,10,21,4,color);}if(level>=3){line(23,-37,29,-53,color,3);ellipse(29,-54,4,4,'#f5a8ff');}if(level>=4){line(-23,-37,-29,-53,color,3);ellipse(-29,-54,4,4,'#a7ffff');}if(level>=5){rect(-15,-51,30,8,4,color);}ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(25,0,25,-1.1,1.1);ctx.stroke();line(36,-22,36,22,'#abffff',2);line(23,0,56,0,'#b4ffff',3);rect(-21,35,42,20,7,'#29324d');label(`L${level}`,0,50,13,'#e1f9ff');ctx.restore();}
function moonGround(){ctx.fillStyle='#10172c';ctx.fillRect(-3000,-3000,6000,6000);for(let i=0;i<180;i++)ellipse((i*173.7)%2400-700,(i*97.3)%1700-400,i%5===0?2:1,1,'#d6e4fa');ellipse(780,60,57,57,'#497ca4');ellipse(767,45,24,37,'#81b8b6');ellipse(480,483,405,340,'#727e96');ellipse(470,465,395,326,'#b0b7c4');for(let i=0;i<28;i++){const x=130+(i*137)%700,y=210+(i*173)%520;if(Math.hypot((x-480)/390,(y-465)/320)<.9){ellipse(x,y,12+i%4*7,8+i%4*5,'#7d899e');ellipse(x+3,y+3,9+i%4*6,6+i%4*4,'#949fb0');}}}
function camera(width,height){const scale=Math.min(width/620,height/1020);return{scale,x:width/2-480*scale,y:height/2-425*scale};}
function draw(){const dpr=Math.min(window.devicePixelRatio||1,2),cw=Math.round(canvas.clientWidth*dpr),ch=Math.round(canvas.clientHeight*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#304b32';ctx.fillRect(0,0,cw,ch);const view=camera(canvas.clientWidth,canvas.clientHeight);ctx.setTransform(view.scale*dpr,0,0,view.scale*dpr,view.x*dpr,view.y*dpr);ctx.fillStyle='#40573b';ctx.fillRect(-3000,-3000,6000,6000);const glow=ctx.createRadialGradient(480,410,50,480,410,600);glow.addColorStop(0,'#68804a');glow.addColorStop(1,'#263e2d');ctx.fillStyle=glow;ctx.fillRect(-3000,-3000,6000,6000);
// The winding dirt trail and hand-painted forest floor.
ctx.strokeStyle='#8b886047';ctx.lineWidth=85;ctx.beginPath();ctx.moveTo(455,-50);ctx.bezierCurveTo(390,140,650,190,522,320);ctx.moveTo(480,580);ctx.bezierCurveTo(400,690,570,750,540,880);ctx.stroke();
for(let i=0;i<190;i++){let x=(i*137.51)%W,y=(i*83.79)%H;ellipse(x,y,2+i%3,1.5,i%3?'#a5b77618':'#172e2425');if(i%4===0){line(x,y,x-3,y-5,'#9cac6930',1);line(x,y,x+2,y-7,'#9cac6930',1);}}
for(let i=0;i<32;i++){let x=(i*173+42)%W,y=(i*233+65)%H;if(x<130||x>825||y<110||y>755)tree(x,y,32+i%4*7);}
[[180,240],[760,650],[205,660],[778,210],[160,430]].forEach(([x,y],i)=>{ellipse(x,y,17,10,'#283c2b66');ellipse(x-3,y-5,15,10,'#78816a');ellipse(x-6,y-9,9,5,'#91947a');});
if(world==='moon')moonGround();
label(world==='moon'?'MOON OUTPOST':'THE SAFE SQUARE',480,246,12,'#d3dfb5');line(375,255,585,255,'#9faf7450',1);rect(grid.x-14,grid.y-8,400,392,18,'#223b2866');
const openingPair=state.recruits===2&&state.units.filter(u=>u?.level===1).length===2;
const slam=state.zombies.find(z=>z.slam)?.slam;
for(let i=0;i<9;i++){const p=center(i),x=p.x-58,y=p.y-58;rect(x,y+6,116,112,10,'#334e2e');rect(x,y,116,112,10,world==='moon'?((i+Math.floor(i/3))%2?'#aebbd1':'#bfc9dc'):((i+Math.floor(i/3))%2?'#85955b':'#8c9c61'));ctx.strokeStyle='#b7c78655';ctx.lineWidth=2;ctx.strokeRect(x+8,y+8,100,96);if(slam?.tile===i){
 rect(x,y,116,112,10,Math.sin(state.time*20)>0?'#da554bba':'#dc69488c');
 rect(x+8,y+94,100,9,4,'#672e2d');
 rect(x+8,y+94,100*slam.remaining/ogreWindup,9,4,'#ffe0b5');
}else if(openingPair&&state.units[i]?.level===1){
 ctx.strokeStyle='#fff0a3';ctx.lineWidth=4;ctx.strokeRect(x+8,y+8,100,96);
}if(i===selected||(keyboard&&cursor===i)){ctx.strokeStyle=i===selected?'#f2de91':'#dfedb1';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(x,y,116,112,10);ctx.stroke();}if(!state.units[i]){line(p.x-6,p.y,p.x+6,p.y,'#becb924a',2);line(p.x,p.y-6,p.x,p.y+6,'#becb924a',2);}}
// Fence posts frame the nine deployment tiles.
for(const x of [277,683])for(const y of [295,410,525,655]){rect(x-5,y-3,10,25,3,'#34422a');rect(x-5,y-8,10,17,3,'#b2a878');}
state.units.forEach((u,i)=>{if(u&&!(dragPoint&&drag===i)){const p=center(i);person(p.x,p.y-4,u.level);slimeHealth(p.x,p.y,u);}});
for(const z of state.zombies){if(z.boss)monster(z);else person(z.x,z.y,1,true,z.wobble);const bar=z.boss?100:62;rect(z.x-bar/2,z.y-82,bar,10,5,'#27372b');rect(z.x-bar/2+1,z.y-81,(bar-2)*z.hp/z.maxHp,8,4,'#e85b62');label(`${z.hp} / ${z.maxHp}`,z.x,z.y-90,14,'#fff0d7');}
for(const a of state.arrows){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle||0);line(-16,0,9,0,'#f6e4ad',2);line(4,-4,10,0,'#f6e4ad',2);line(4,4,10,0,'#f6e4ad',2);ctx.restore();}
if(dragPoint&&drag>=0&&state.units[drag]){slime(dragPoint.x,dragPoint.y-4,state.units[drag].level);slimeHealth(dragPoint.x,dragPoint.y,state.units[drag]);}
for(const e of state.effects){ctx.globalAlpha=Math.min(1,e.life);label(e.text,e.x,e.y,18,e.color);}ctx.globalAlpha=1;
label(state.units.some(Boolean)?'MATCH A PAIR. GROW YOUR CREW.':'RECRUIT YOUR FIRST SLIME →',480,713,12,'#c6d7a6');}
function tile(e){const r=canvas.getBoundingClientRect(),view=camera(r.width,r.height),x=(e.clientX-r.left-view.x)/view.scale,y=(e.clientY-r.top-view.y)/view.scale;const col=Math.floor((x-grid.x)/grid.size),row=Math.floor((y-grid.y)/grid.size);return col>=0&&col<3&&row>=0&&row<3?row*3+col:-1;}
function pointerPosition(e){const r=canvas.getBoundingClientRect(),v=camera(r.width,r.height);return{x:(e.clientX-r.left-v.x)/v.scale,y:(e.clientY-r.top-v.y)/v.scale};}
canvas.addEventListener('pointerdown',e=>{if(paused||e.isPrimary===false)return;drag=tile(e);dragPoint=drag>=0&&state.units[drag]?pointerPosition(e):null;canvas.setPointerCapture(e.pointerId);canvas.focus();});
canvas.addEventListener('pointermove',e=>{if(dragPoint&&e.isPrimary!==false)dragPoint=pointerPosition(e);});
canvas.addEventListener('pointerup',e=>{if(e.isPrimary===false)return;const end=tile(e);if(drag>=0&&end>=0){if(drag!==end&&state.units[drag]){selected=drag;select(end);}else select(end);}drag=-1;dragPoint=null;});
canvas.addEventListener('pointercancel',()=>{drag=-1;dragPoint=null;});canvas.addEventListener('lostpointercapture',()=>{drag=-1;dragPoint=null;});
$('portal').onclick=openPortal;$('travel').onclick=travel;
$('help').onclick=()=>{if(!state.lives)return;if(!paused)pause();$('overlay-title').textContent='Slime survival guide';$('overlay-text').textContent='Recruit caveman slimes. Drag matching levels together to unlock medieval outfits, double damage, and faster arrows. Every 20 zombie kills brings a monster boss. After each boss, enemies spawn faster and hit harder. When the Ogre marks a tile, move the slime before the slam. Touch: tap or drag. Keyboard: arrows, Enter, B. Gamepad: D-pad, A, X.';};$('buy').onclick=buy;$('pause').onclick=pause;$('resume').onclick=()=>state.lives?pause():reset();$('exit').onclick=()=>{if(window.RunXR)window.RunXR.exit();else message('You are playing standalone. Close this tab to exit.');};
function move(dx,dy){keyboard=true;cursor=((Math.floor(cursor/3)+dy+3)%3)*3+(cursor%3+dx+3)%3;}
window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key==='Enter'||e.key===' '))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter','w','a','s','d','b','p','escape'].includes(k))e.preventDefault();if(e.repeat)return;if(k==='o')openPortal();else if(k==='p')pause();else if(k==='escape'){selected=-1;if(window.RunXR)window.RunXR.exit();else if(!paused)pause();}else if(paused){if(k==='enter'||k===' '){if(!$('travel').hidden)travel();else state.lives?pause():reset();}}else if(k==='b')buy();else if(k==='enter'||k===' ')select(cursor);else if(k==='arrowleft'||k==='a')move(-1,0);else if(k==='arrowright'||k==='d')move(1,0);else if(k==='arrowup'||k==='w')move(0,-1);else if(k==='arrowdown'||k==='s')move(0,1);});
function gamepad(t){const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(!pad){previousPad=[];return;}const b=pad.buttons.map(v=>v.pressed),pressed=i=>b[i]&&!previousPad[i];if((b[8]&&b[9])||pressed(16)){window.RunXR?.exit();previousPad=b;return;}if(pressed(3))openPortal();if(pressed(9))pause();if(pressed(0)){if(paused){if(!$('travel').hidden)travel();else state.lives?pause():reset();}else select(cursor);}if(pressed(1))selected=-1;if(pressed(2))buy();if(!paused&&t-stickTime>180){const dx=b[14]||pad.axes[0]<-.5?-1:b[15]||pad.axes[0]>.5?1:0,dy=b[12]||pad.axes[1]<-.5?-1:b[13]||pad.axes[1]>.5?1:0;if(dx||dy){move(dx,dy);stickTime=t;}}previousPad=b;}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&state.lives)pause();last=0;});
function frame(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;gamepad(t);update(dt);draw();requestAnimationFrame(frame);}reset();window.RunXR?.ready();requestAnimationFrame(frame);
