import { getStore } from '@netlify/blobs';

const store=getStore({name:'marketplace',consistency:'strong'});

export default async (req,context)=>{
  try{
    const key=decodeURIComponent(context.params.key||'');
    if(!key.startsWith('images/')) return new Response('Not found',{status:404});
    const blob=await store.get(key,{type:'blob'});
    if(!blob) return new Response('Not found',{status:404});
    const type=blob.type||'image/jpeg';
    return new Response(blob,{headers:{'Content-Type':type,'Cache-Control':'public,max-age=31536000,immutable'}});
  }catch(e){return new Response('Not found',{status:404})}
};

export const config={path:'/api/image/:key*'};
