'use strict';
const $=id=>document.getElementById(id);let type='barcode',current=null;const types={barcode:{w:8,h:1.5},qr:{w:3,h:3}};
function invalidate(){current=null;$('output').hidden=true;$('empty').hidden=false;for(const id of ['pdf','png','svg','print'])$(id).disabled=true;$('status').textContent='Gere o código para atualizar a prévia.';}
$('contentKind').onchange=()=>{$('email').required=$('contentKind').value==='login';$('password').required=$('contentKind').value==='senha';invalidate();};
for(const el of ['email','password','width','height'])$(el).addEventListener('input',invalidate);
for(const button of document.querySelectorAll('[data-type]'))button.onclick=()=>{types[type]={w:$('width').value,h:$('height').value};type=button.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b===button));$('width').value=types[type].w;$('height').value=types[type].h;$('height').disabled=type==='qr';$('sizeHelp').textContent=type==='qr'?'QR Code quadrado • Requer um leitor 2D.':'Code 128 • Compatível com leitores de códigos 1D.';$('badge').textContent=type==='qr'?'QR CODE':'CODE 128';invalidate();};
$('width').addEventListener('input',()=>{if(type==='qr')$('height').value=$('width').value;});
$('show').onclick=()=>{const shown=$('password').type==='text';$('password').type=shown?'password':'text';$('show').textContent=shown?'Mostrar':'Ocultar';};
$('clear').onclick=()=>{$('email').value='';$('password').value='';$('password').type='password';$('show').textContent='Mostrar';invalidate();$('email').focus();};
$('form').onsubmit=e=>{e.preventDefault();try{const w=Number($('width').value)*10,h=Number($('height').value)*10;if(w<10||w>300||h<10||h>300)throw Error('Escolha medidas entre 1 e 30 cm.');const kind=$('contentKind').value;const payload=kind==='login'?$('email').value.trim():$('password').value;if(!payload)throw Error('Preencha o '+(kind==='login'?'login.':'campo Senha.'));if(/[\t\r\n]/.test(payload))throw Error('Remova Tab ou quebras de linha do conteúdo.');if(!window.JsBarcode||!window.qrcode)throw Error('Não foi possível carregar os geradores.');let svg,notice='Pronto. Imprima em tamanho real (100%), sem ajustar à página.';
if(type==='barcode'){if(/[^\x00-\x7f]/.test(payload))throw Error('Code 128 aceita caracteres ASCII. Para acentos ou outros caracteres, use QR Code.');svg=document.createElementNS('http://www.w3.org/2000/svg','svg');JsBarcode(svg,payload,{format:'CODE128',displayValue:false,width:2,height:100,margin:20,background:'#ffffff',lineColor:'#000000'});const natural=parseFloat(svg.getAttribute('width'));svg.setAttribute('viewBox',`0 0 ${natural} 140`);svg.setAttribute('preserveAspectRatio','none');const moduleMm=w/natural*2;notice+=` Barra mínima: ${moduleMm.toFixed(2)} mm.`;if(moduleMm<.19)notice+=' Código muito denso: aumente a largura ou teste no coletor antes de imprimir.';
}else{const qr=qrcode(0,'M');qr.addData(payload,'Byte');qr.make();const n=qr.getModuleCount(),pad=4,size=n+pad*2;svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);const rect=document.createElementNS(svg.namespaceURI,'rect');rect.setAttribute('width',size);rect.setAttribute('height',size);rect.setAttribute('fill','white');svg.append(rect);const path=document.createElementNS(svg.namespaceURI,'path');let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))d+=`M${x+pad} ${y+pad}h1v1h-1z`;path.setAttribute('d',d);path.setAttribute('fill','black');svg.append(path);if(w/size<.3)notice+=' QR muito denso: aumente o tamanho e teste a leitura.';}
svg.setAttribute('width',w+'mm');svg.setAttribute('height',h+'mm');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('shape-rendering','crispEdges');$('output').replaceChildren(svg);$('output').hidden=false;$('empty').hidden=true;$('measure').textContent=`${w/10} × ${h/10} cm`;$('status').textContent=(kind==='login'?'Login':'Senha')+' separado, sem Tab e sem Enter. '+notice;current={svg,w,h,type,kind};for(const id of ['pdf','png','svg','print'])$(id).disabled=false;
}catch(err){invalidate();$('status').textContent=err.message;}};
function download(blob,ext){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=current.kind+'-'+current.type+'.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function serialize(){return new XMLSerializer().serializeToString(current.svg);}
async function raster(){const snapshot=current;const url=URL.createObjectURL(new Blob([serialize()],{type:'image/svg+xml'}));try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=Math.round(snapshot.w/25.4*600);canvas.height=Math.round(snapshot.h/25.4*600);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas;}finally{URL.revokeObjectURL(url);}}
let exportBusy=false;
async function exportConfirmed(format, action){
 if(exportBusy || !current)return;
 exportBusy=true;
 const buttons=['pdf','png','svg'];
 buttons.forEach(id=>$(id).disabled=true);
 try{
  if(!window.confirm(`Deseja baixar o código em ${format.toUpperCase()}?`))return;
  await action();
  $('status').textContent='Download solicitado. Para baixar outra cópia, confirme novamente.';
 }catch(error){$('status').textContent='Falha na exportação: '+error.message;}
 finally{
  // Mantém o bloqueio por um instante para absorver o segundo clique.
  setTimeout(()=>{exportBusy=false;buttons.forEach(id=>$(id).disabled=!current);},1000);
 }
}
$('svg').onclick=()=>exportConfirmed('svg',async()=>download(new Blob([serialize()],{type:'image/svg+xml'}),'svg'));
$('png').onclick=()=>exportConfirmed('png',async()=>{const snapshot=current,c=await raster();const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Não foi possível gerar a imagem.'))));if(current!==snapshot)throw Error('Os dados foram alterados. Gere o código novamente.');download(blob,'png');});
$('pdf').onclick=()=>exportConfirmed('pdf',async()=>{const snapshot=current,{w,h}=snapshot,c=await raster();if(current!==snapshot)throw Error('Os dados foram alterados. Gere o código novamente.');const doc=new window.jspdf.jsPDF({orientation:w>=h?'landscape':'portrait',unit:'mm',format:[w,h]});doc.addImage(c.toDataURL('image/png'),'PNG',0,0,w,h);doc.save(snapshot.kind+'-'+snapshot.type+'.pdf');});
$('print').onclick=()=>{const {w,h}=current,frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:0;height:0;border:0';document.body.append(frame);const doc=frame.contentDocument;doc.open();doc.write(`<!doctype html><html><head><title>Etiqueta de acesso</title><style>@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0;padding:0;width:${w}mm;height:${h}mm}svg{display:block}</style></head><body>${serialize()}</body></html>`);doc.close();frame.contentWindow.focus();setTimeout(()=>{frame.contentWindow.print();setTimeout(()=>frame.remove(),60000);},200);};
