const products = document.getElementById('products');
const statusEl = document.getElementById('status');
const createModal = document.getElementById('createModal');
const viewModal = document.getElementById('viewModal');
const form = document.getElementById('adForm');
const photos = document.getElementById('photos');
const preview = document.getElementById('photoPreview');
const publish = document.getElementById('publish');
let ads = [];

const money = v => Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc = s => { const d=document.createElement('div'); d.textContent=s ?? ''; return d.innerHTML; };

function openModal(el){el.classList.remove('hidden')}
function closeModal(el){el.classList.add('hidden')}

document.getElementById('openCreate').onclick=()=>openModal(createModal);
document.getElementById('refresh').onclick=loadAds;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(document.getElementById(b.dataset.close)));
window.addEventListener('click',e=>{if(e.target===createModal)closeModal(createModal);if(e.target===viewModal)closeModal(viewModal)});

photos.addEventListener('change',()=>{
  preview.innerHTML='';
  if(photos.files.length>3){alert('Você pode adicionar no máximo 3 fotos.');photos.value='';return}
  [...photos.files].forEach(file=>{const img=document.createElement('img');img.src=URL.createObjectURL(file);preview.appendChild(img)});
});

async function loadAds(){
  statusEl.textContent='Carregando anúncios...';
  try{
    const r=await fetch('/api/ads');
    if(!r.ok) throw new Error('Falha ao carregar');
    ads=await r.json();
    renderAds();
  }catch(e){
    statusEl.textContent='Não foi possível carregar os anúncios.';
    products.innerHTML='<div class="empty">Verifique se as Functions e o Netlify Blobs estão configurados.</div>';
  }
}

function renderAds(){
  statusEl.textContent=`${ads.length} anúncio(s)`;
  if(!ads.length){products.innerHTML='<div class="empty">Nenhum anúncio ainda.<br>Clique no botão + para publicar o primeiro.</div>';return}
  products.innerHTML=ads.map(a=>`<article class="card" data-id="${esc(a.id)}"><img class="card-img" src="${esc(a.images?.[0]||'')}" alt="${esc(a.title)}"><div class="card-info"><h3>${esc(a.title)}</h3><div class="price">${money(a.price)}</div><div class="location">📍 ${esc(a.location)}</div></div></article>`).join('');
  products.querySelectorAll('.card').forEach(c=>c.onclick=()=>showAd(c.dataset.id));
}

async function showAd(id){
  const a=ads.find(x=>x.id===id); if(!a)return;
  document.getElementById('detail').innerHTML=`<div class="detail-gallery">${(a.images||[]).map(x=>`<img src="${esc(x)}" alt="${esc(a.title)}">`).join('')}</div><h1 class="detail-title">${esc(a.title)}</h1><div class="price">${money(a.price)}</div><div class="detail-description">${esc(a.description)}</div><div class="info">📍 <b>Local</b><br>${esc(a.location)}</div><div class="info">📞 <b>Contato</b><br>${esc(a.contact)}</div><a class="contact" href="https://wa.me/${String(a.contact).replace(/\D/g,'')}" target="_blank" rel="noopener">Conversar no WhatsApp</a>`;
  openModal(viewModal);
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(photos.files.length<1||photos.files.length>3){alert('Escolha de 1 a 3 fotos.');return}
  publish.disabled=true; publish.textContent='Publicando...';
  const fd=new FormData();
  [...photos.files].forEach(f=>fd.append('photos',f));
  fd.append('title',document.getElementById('title').value.trim());
  fd.append('description',document.getElementById('description').value.trim());
  fd.append('price',document.getElementById('price').value);
  fd.append('location',document.getElementById('location').value.trim());
  fd.append('contact',document.getElementById('contact').value.trim());
  try{
    const r=await fetch('/api/ads',{method:'POST',body:fd});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||'Erro');
    form.reset();preview.innerHTML='';closeModal(createModal);await loadAds();alert('Anúncio publicado com sucesso!');
  }catch(err){alert(err.message||'Erro ao publicar anúncio.')}finally{publish.disabled=false;publish.textContent='Publicar anúncio'}
});

loadAds();
