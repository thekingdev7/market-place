import { getStore } from '@netlify/blobs';

const store = getStore({ name: 'marketplace', consistency: 'strong' });
const MAX_IMAGE = 5 * 1024 * 1024;

function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
function id(){return crypto.randomUUID()}

export default async (req) => {
  try {
    if(req.method==='GET'){
      const {blobs}=await store.list({prefix:'ads/'});
      const out=[];
      for(const b of blobs){
        const ad=await store.get(b.key,{type:'json'});
        if(ad) out.push(ad);
      }
      out.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      return json(out);
    }

    if(req.method==='POST'){
      const form=await req.formData();
      const title=String(form.get('title')||'').trim();
      const description=String(form.get('description')||'').trim();
      const price=Number(form.get('price'));
      const location=String(form.get('location')||'').trim();
      const contact=String(form.get('contact')||'').trim();
      const files=form.getAll('photos').filter(x=>x instanceof File);

      if(!title||!description||!location||!contact||!Number.isFinite(price)||price<0) return json({error:'Preencha todos os campos corretamente.'},400);
      if(files.length<1||files.length>3) return json({error:'Envie de 1 a 3 fotos.'},400);

      const adId=id();
      const images=[];
      for(let i=0;i<files.length;i++){
        if(files[i].size>MAX_IMAGE) return json({error:'Cada foto deve ter no máximo 5 MB.'},400);
        if(!files[i].type.startsWith('image/')) return json({error:'Apenas imagens são permitidas.'},400);
        const key=`images/${adId}/${i}-${id()}`;
        await store.set(key,await files[i].arrayBuffer(),{metadata:{contentType:files[i].type}});
        images.push(`/api/image/${encodeURIComponent(key)}`);
      }

      const ad={id:adId,title,description,price,location,contact,images,createdAt:Date.now()};
      await store.setJSON(`ads/${adId}`,ad);
      return json(ad,201);
    }

    return json({error:'Método não permitido.'},405);
  } catch(e){
    console.error(e);
    return json({error:'Erro interno no servidor.'},500);
  }
};

export const config={path:'/api/ads'};
  
