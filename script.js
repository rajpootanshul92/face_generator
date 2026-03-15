function addElement(src){

const img = new Image();
img.src = src;

img.onload = () =>{

let type = "element";

if(src.includes("/face/")) type="face";
else if(src.includes("/eyes/")) type="eyes";
else if(src.includes("/eyebrows/")) type="eyebrows";
else if(src.includes("/nose/")) type="nose";
else if(src.includes("/lips/")) type="lips";
else if(src.includes("/hair/")) type="hair";
else if(src.includes("/beard/")) type="beard";
else if(src.includes("/moustache/")) type="moustache";
else if(src.includes("/left_ears/")) type="left ear";
else if(src.includes("/right_ears/")) type="right ear";

if(type!=="left ear" && type!=="right ear"){

const existing = elements.find(el=>el.type===type);

if(existing){
elements.splice(elements.indexOf(existing),1);
}

}

let x = canvas.width/2 - img.width/4;
let y = canvas.height/2 - img.height/4;

const el = new Element(img,x,y,type);

const newPriority = layerPriority[type] ?? 100;

let inserted=false;

for(let i=0;i<elements.length;i++){

const existingPriority = layerPriority[elements[i].type] ?? 100;

if(newPriority < existingPriority){

elements.splice(i,0,el);
inserted=true;
break;

}

}

if(!inserted) elements.push(el);

selectedElement = el;

redraw();

};

}
