document.getElementById("close").onclick = function(e){
  document.getElementById("modal").style.transform = "translate(0,-300%)"
  document.getElementById("modal-under").style.opacity = "0"
}


var taptarget;
var pendown = false;
maxHist=20;
var tempcanv = document.createElement("canvas")
tempcanv.width = 1920
tempcanv.height = 1080
tempcanv.ctxi = tempcanv.getContext("2d")
tempcanv.active = false
var line = false
lastx = 0;
undoe=false;
redoe=false;
lasty = 0;
var tradius = 15
var toolbar = document.getElementById("tools")
var layers = document.getElementById("layers")
var defaulted = false
holdtime = 0
var workspace = document.getElementById("workspace")
var restartclicked = false
restart = document.getElementById("enditall")
handleRS=function(e){
  
  e.preventDefault();
  restartclicked = true
  
}
handleRE=function(e){
  e.preventDefault();
  restartclicked = false
}
toHistory = function(clearFuture,canvextension){
  if(clearFuture){future = [];}
  var canv = document.createElement("canvas")
  canv.width = 1920
  canv.height = 1080
  canv.ctxi = canv.getContext("2d")
  
  past.unshift({canvas:canv,frame:activecanvas.frame,layer:activecanvas.layer})
  past[0].canvas.ctxi.clearRect(0,0,1920,1080)
  if(canvextension){
  past[0].canvas.ctxi.drawImage(canvextension,0,0)}else{
    past[0].canvas.ctxi.drawImage(canvases[activecanvas.frame][activecanvas.layer],0,0)
  }
  //past[0].canvas.ctxi.fillStyle = "#000000"
  //past[0].canvas.ctxi.fillRect(0,0,100,100)
  
}
var activecanvas = {layer:0,frame:0}
var past = []

var future = []
var undo = document.getElementsByClassName("tools")[0]
var redo = document.getElementsByClassName("tools")[1]
var zoom = 1
var stabilizer = 1
var lastradi = 0
var camx = 0
var camy = 0
var lastx = 0
var lasty = 0
var lastpos = {}
var lastz = 0
var lastr = 0
var tapx1 = 0
var tapy1 = 0
var tapx2 = 0
var tapy2 = 0
var starttapx1 = 0
var starttapy1 = 0
var starttapx2 = 0
var starttapy2 = 0
redo.onclick = function(){
  if(redoe){
  toHistory()
  activecanvas = {frame:future[0].frame,layer:future[0].layer}
  
  canvases[activecanvas.frame][activecanvas.layer].ctxi.clearRect(0,0,1920,1080)
  canvases[activecanvas.frame][activecanvas.layer].ctxi.drawImage(future[0].canvas,0,0)
  future.shift()}
}
undo.onclick = function(){
  if(undoe){
  var fucan = document.createElement("canvas")
  fucan.width = 1920
  fucan.height = 1080
  fucan.ctxi = fucan.getContext("2d")
  fucan.ctxi.drawImage(canvases[activecanvas.frame][activecanvas.layer],0,0)
  future.unshift({canvas:fucan,frame:activecanvas.frame,layer:activecanvas.layer})
  
  activecanvas = {frame:past[0].frame,layer:past[0].layer}
  
  canvases[activecanvas.frame][activecanvas.layer].ctxi.clearRect(0,0,1920,1080)
  
  canvases[activecanvas.frame][activecanvas.layer].ctxi.drawImage(past[0].canvas,0,0)
  
  
  past.shift()
  }
}
commitLine = function(can,quality){
  
  for(i=2;i<line.length;i++){
    pr = i/line.length
    pr2 = (i+1)/line.length
    w = tradius*Math.sin(pr*Math.PI)
    w2 = tradius*Math.sin(pr2*Math.PI)
    ow = Math.sin(pr*Math.PI)
    can.beginPath()
    can.lineCap = "round"
  can.moveTo(line[i-2].x,line[i-2].y)
    var oofx = line[i-1].x-((line[i-2].x+line[i].x)/2)
    var oofy = line[i-1].y-((line[i-2].y+line[i].y)/2)
    var linedir = Math.atan2(line[i].x-line[i-2].x,line[i].y-line[i-2].y)
    can.quadraticCurveTo(line[i-1].x+oofx,line[i-1].y+oofy,line[i].x,line[i].y)
    
    can.lineWidth = w
    can.stroke()
  }
}
dragging = false
Math.pyth = function(x,y){
  return Math.sqrt(Math.pow(x,2)+Math.pow(y,2))
}
var canvases = [[]]
var rot = 0
var createLayer = function(z,frame){
  var canv = document.createElement("canvas")
  canv.width = 1920
  canv.height = 1080
  canv.ctxi = canv.getContext("2d")
  canvases[frame][z]=canv
  
  
  var list = document.getElementById("layers");
  while(list.childNodes[0]){
  list.removeChild(list.childNodes[0]);
  }
  for(cii in canvases[activecanvas.frame]){
    document.getElementById("layers").appendChild(canvases[activecanvas.frame][cii])
    
  }
}

createLayer(0,0)

var disp = document.getElementById("display")
disp.width = 1920
disp.height = 1080
var dctx = disp.getContext('2d')
toCanvasPoint = function(x,y){
  var rect = disp.getBoundingClientRect();
  cx = (rect.left+rect.right)/2
  cy = (rect.top+rect.bottom)/2
  document.getElementById("click").style.left = (x-5)+"px"
  document.getElementById("click").style.top = (y-5)+"px"
  var rect2 = document.getElementById("click").getBoundingClientRect();
  var ih = window.innerHeight-45
  cx2 = (rect2.left+rect2.right)/2
  cy2 = (rect2.top+rect2.bottom)/2
  x=cx2-cx
  y=cy2-cy
  
  
  y*=(1080/ih)
  x*=(1080/ih)
  x/=zoom
  y/=zoom
  r=Math.pyth(x,y)
  o=Math.atan2(x,y)
  roff=(rot/(360)*(Math.PI*2))
  x=r*Math.sin(o+roff)
  y=r*Math.cos(o+roff)
  x+=1920/2
  y+=1080/2
  
  return {x:x,y:y}
}
handleEnd = function(e){
  pendown = false
  if(TAPSTARTY>45){
  tempcanv.active = false
  if(tool==0&&dragging==false){
  toHistory(true)
  commitLine(canvases[activecanvas.frame][activecanvas.layer].ctxi,2)
  line = false
  }
  if(tool==2&&dragging==false){
    
    toHistory(true,tempcanv)
    
  }
  }
}
handleStart = function(e){
  pendown = true;
  taptarget = e.changedTouches["0"].target
  TAPSTARTY = e.changedTouches["0"].pageY
  if(TAPSTARTY>45){
  if(defaulted==true){
    
  e.preventDefault();}else{defaulted=true}
  dragging = false
  if(e.changedTouches["1"]){
  line = false
    
  }else{
  if(tool==0){
  var pos =toCanvasPoint(e.changedTouches["0"].pageX,e.changedTouches["0"].pageY)
  lastpos.x = pos.x
    lastpos.y = pos.y
    lastradi = 0
  line = [{x:pos.x,y:pos.y}]
  
  
  }
  if(tool==2){
    
    if(tempcanv.active!=true){
      
      tempcanv.ctxi.clearRect(0,0,1920,1080)
      tempcanv.ctxi.drawImage(canvases[activecanvas.frame][activecanvas.layer],0,0)
      tempcanv.active = true;
    }
    //toHistory(true)
    var pos =toCanvasPoint(e.changedTouches["0"].pageX,e.changedTouches["0"].pageY)
    
    lastx = pos.x
    lasty = pos.y
  }
    
  }}
}
handleMove = function(e){
  if(TAPSTARTY>45){
  e.preventDefault();
  
  if((e.changedTouches["1"]&&e.changedTouches["0"])){
    line = false
    if(tool==2&&dragging==false){canvases[activecanvas.frame][activecanvas.layer].ctxi.clearRect(0,0,1920,1080);canvases[activecanvas.frame][activecanvas.layer].ctxi.drawImage(tempcanv,0,0)}
    tapx1 = e.changedTouches["0"].pageX
    tapy1 = e.changedTouches["0"].pageY
    if(e.changedTouches["1"]){
    tapx2 = e.changedTouches["1"].pageX
    tapy2 = e.changedTouches["1"].pageY
    }
    
    
    if(dragging==false){
      lastx = camx;
      lasty = camy;
      lastz = zoom;
      lastr = rot;
      starttapx1 = tapx1
      starttapy1 = tapy1
      starttapx2 = tapx2
      starttapy2 = tapy2
    }
    if(Math.pyth(tapx1-starttapx1,tapy1-starttapy1)>10099999){
       tempx = tapx1;
       tempy = tapy1;
       tapx1 = tapx2
       tapy1 = tapy2
       tapx2 = tempx
       tapy2 = tempy
       }
    
    cenx = (tapx1+tapx2)/2
    ceny = (tapy1+tapy2)/2
    cenxl = (starttapx1+starttapx2)/2
    cenyl = (starttapy1+starttapy2)/2
    diff = Math.pyth(tapx1-tapx2,tapy1-tapy2)
    diff2 = Math.pyth(starttapx1-starttapx2,starttapy1-starttapy2)
    zoom*=(diff/diff2)
    rot+=(Math.atan2(tapx1-cenx,tapy1-ceny)-Math.atan2(starttapx1-cenxl,starttapy1-cenyl))/(Math.PI*2)*-360
    dragging = true
    var pirot = rot/360*Math.PI*2
    camx+=((cenx-cenxl)*Math.cos(pirot))/zoom
    camx+=((ceny-cenyl)*Math.sin(pirot))/zoom
    camy+=((ceny-cenyl)*Math.cos(pirot))/zoom
    camy-=((cenx-cenxl)*Math.sin(pirot))/zoom
    
    lastx = camx;
      lasty = camy;
      lastz = zoom;
      lastr = rot;
      starttapx1 = tapx1
      starttapy1 = tapy1
      starttapx2 = tapx2
      starttapy2 = tapy2
    
  }else{
    if(tool==0){
  var pos =toCanvasPoint(e.changedTouches["0"].pageX,e.changedTouches["0"].pageY)
  var radi = Math.pyth(e.changedTouches["0"].radiusX,e.changedTouches["0"].radiusY)
  
    //line[line.length]={x:pos.x,y:pos.y}
    var stable = {x:pos.x,y:pos.y}
    var sicnt = 1;
    for(si=1;si<=stabilizer&&si<line.length;si++){
      stable.x+=line[line.length-si].x
      stable.y+=line[line.length-si].y
      sicnt = si+1
    }
      stable.x/=sicnt
    stable.y/=sicnt
    for(lii=0.5;lii<1.01;lii+=0.5){
      pox = line[line.length-1].x
      poy = line[line.length-1].y
    
    line[line.length]={x:pox+(stable.x-pox)*lii,y:poy+(stable.y-poy)*lii}
   lastpos.x = pos.x
    lastpos.y = pos.y
  lastradi = radi
    }
    }
    if(tool==2&&dragging==false){
      var pos =toCanvasPoint(e.changedTouches["0"].pageX,e.changedTouches["0"].pageY)
      var activectx = canvases[activecanvas.frame][activecanvas.layer].ctxi
      activectx.save()
      activectx.beginPath()
      odir = Math.atan2(pos.x-lastx,pos.y-lasty)
      activectx.arc(lastx,lasty,tradius,-odir+Math.PI,-odir,false)
      activectx.arc(pos.x,pos.y,tradius,-odir,-odir+Math.PI,false)
      activectx.arc(lastx,lasty,tradius,-odir+Math.PI,-odir,false)
     
      activectx.clip()
      activectx.clearRect(0,0,1920,1080)
      activectx.restore()
      lastx = pos.x
      lasty = pos.y
    }
  }}
}
document.body.addEventListener("touchstart",handleStart,false)
document.body.addEventListener("touchmove",handleMove,false)
document.body.addEventListener("touchend",handleEnd,false)
restart.addEventListener("touchstart",handleRS,false)
restart.addEventListener("touchend",handleRE,false)
tool = 0
icons = document.createElement('IMG')
icons.src = "https://github.com/JuniperMakesStuff/alupaint/blob/master/icons.png?raw=true"
renderFrame = function(){
  if(past.length>0){
    undoe = true
    undo.style.transform = "scale(1)"
    undo.style.filter = "contrast(100%)"
  }else{
    undoe = false
    undo.style.transform = "scale(0.9)"
    undo.style.filter = "contrast(50%)"
  }
  if(future.length>0){
    redoe=true
    redo.style.transform = "scale(1)"
    redo.style.filter = "contrast(100%)"
  }else{
    redoe=false
    redo.style.transform = "scale(0.9)"
    redo.style.filter = "contrast(50%)"
  }
  
  dctx.clearRect(0,0,1920,1080)
  
  window.requestAnimationFrame(renderFrame)
  if(past.length>maxHist){past.pop()}
  if(future.length>maxHist){future.pop()}
  if(pendown==false){
  for(li=canvases[activecanvas.frame].length-1;li>=0;li--){
    dctx.drawImage(canvases[activecanvas.frame][li],0,0)
  }}else{
    dctx.drawImage(canvases[activecanvas.frame][activecanvas.layer],0,0)
  }
  
  if(line!=false){
  commitLine(dctx,1)
  }
  
  document.documentElement.style.setProperty('--zoom',zoom)
  document.documentElement.style.setProperty('--rotate',rot+"deg")
  document.documentElement.style.setProperty('--x',camx+"px")
  document.documentElement.style.setProperty('--y',camy+"px")
  tools = document.getElementsByClassName("brushes");
  for (i = 0; i < tools.length; i++) {
    tools[i].style.backgroundPosition = (-288+i*-32)+"px 0px"
    if(i==tool){
      tools[i].style.animation = "selected 0.5s linear, blink 0.5s infinite"
      tools[i].style.transform = "scale(1,1)"
    }else{
      tools[i].style.animation = "none"
      tools[i].style.transform = "scale(1,1)"
    }
    if(tools[i]==document.activeElement){
      tool = i
    }
  }
  
  tools = document.getElementsByClassName("tools");
  for (i = 0; i < tools.length; i++) {
    tools[i].style.backgroundPosition = (-288+i*-32-96)+"px 0px"
  }
  
  var list = document.getElementById("layers");
  for(cii=0;cii<list.childNodes.length;cii++){
    if(list.childNodes[cii]==canvases[activecanvas.frame][activecanvas.layer]){
      list.childNodes[cii].style.animation = "blink 0.5s infinite"
    }else{
      list.childNodes[cii].style.animation = ""
    }
    if(list.childNodes[cii]==taptarget){
      activecanvas.layer = cii
    }
  }
  
  
  document.documentElement.style.filter = "brightness("+(100+900*holdtime)+"%)"
  if (restartclicked){
    document.getElementById("blacktop").style.transform = "translate(0,-50%)"
    document.getElementById("blackbottom").style.transform = "translate(0,50%)"
    workspace.style.transform = "scale(0,2)"
    toolbar.style.transform = "translate(0,-100%)"
    layers.style.transform = "translate(0,100%)"
    document.getElementById("logounder").style.transform = "translate(100%,0%)"
    restart.style.transform = "translate("+(window.innerWidth/2-288)+"px,"+(window.innerHeight/2)+"px) translate(-50%,-50%) translate("+(50*Math.random()-25)+"px,"+(50*Math.random()-25)+"px) scale(2) rotate("+Math.pow(1+(20*holdtime),3)+"deg)"
    
    
    restart.style.transition = "ease "+(0.5-holdtime/2)+"s"
    restart.style.boxShadow = "0px 0px 10px red inset,0px 0px 10px red"
    //restart.style.backgroundColor = "#ff0000"
    holdtime+=0.008;
    if(holdtime>=1){
      tempcanv.ctxi.clearRect(0,0,1920,1080)
      holdtime = -500;
      restartclicked = false;
      future = []
      past = []
      activecanvas = {frame:0,layer:0}
      canvases = [[]]//here
      
      createLayer(0,0)
      console.log(layers)
      line = false
    }
  }else{
    document.getElementById("blacktop").style.transform = "translate(0,-100%)"
    document.getElementById("blackbottom").style.transform = "translate(0,100%)"
    workspace.style.transform = "scale(1,1)"
    toolbar.style.transform = "translate(0,0%)"
    layers.style.transform = "translate(0,0%)"
    document.getElementById("logounder").style.transform = "translate(0%,0%)"
    
    
    
    holdtime/=2;
    restart.style.transform = "translate(0px,0px)"
    restart.style.transition = "ease 2s"
    restart.style.boxShadow = "0px 0px 0px red inset,0px 0px 0px red"
    restart.style.backgroundColor = "#000000"
  }
}

renderFrame()
