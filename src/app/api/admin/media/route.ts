import {NextRequest,NextResponse} from 'next/server';
import {authenticated} from '@/lib/auth';
import {safeMutation} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import {mediaConfig,imageUrl,prepareImage,MAX_IMAGE_BYTES} from '@/lib/media';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 if(!await authenticated())return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const {bucket}=mediaConfig();const q=(req.nextUrl.searchParams.get('q')||'').slice(0,120);
  const raw=Number(req.nextUrl.searchParams.get('before'));const before=Number.isSafeInteger(raw)&&raw>0?raw:null;
  const r=await db.query('SELECT id,url,filename,width,height,bytes FROM dt_media WHERE bucket=$1 AND ($2::text=\'\' OR POSITION(LOWER($2) IN LOWER(filename))>0) AND ($3::bigint IS NULL OR id<$3) ORDER BY id DESC LIMIT 41',[bucket,q,before]);
  return NextResponse.json({images:r.rows.slice(0,40),next:r.rows.length>40?r.rows[39].id:null},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Media library',e);return NextResponse.json({error:'Media library unavailable. Check its database migration and bucket settings.'},{status:503});}
}
export async function POST(req:NextRequest){
 if(!await authenticated()||!await safeMutation(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 if(Number(req.headers.get('content-length')||0)>MAX_IMAGE_BYTES+100000)return NextResponse.json({error:'Choose an image up to 5 MB.'},{status:413});
 try{
  const {bucket,region}=mediaConfig();const form=await req.formData();const file=form.get('image');
  if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))return NextResponse.json({error:'Choose a JPG, PNG or WebP image.'},{status:415});
  if(!file.size||file.size>MAX_IMAGE_BYTES)return NextResponse.json({error:'Choose an image up to 5 MB.'},{status:413});
  let prepared:Awaited<ReturnType<typeof prepareImage>>;
  try{prepared=await prepareImage(Buffer.from(await file.arrayBuffer()));}catch{return NextResponse.json({error:'Cannot process this image. Use a still JPG, PNG or WebP up to 5 MB and 40 megapixels.'},{status:415});}
  const client=await db.connect();
  try{
   await client.query('BEGIN');
   await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[bucket+prepared.hash]);
   const existing=await client.query('SELECT url,object_key AS key FROM dt_media WHERE bucket=$1 AND content_hash=$2',[bucket,prepared.hash]);
   if(existing.rows.length){await client.query('COMMIT');return NextResponse.json({...existing.rows[0],reused:true});}
   const date=new Date().toISOString().slice(0,7).replace('-','/');const key=`products/${date}/${prepared.hash}.webp`;
   await new S3Client({region}).send(new PutObjectCommand({Bucket:bucket,Key:key,Body:prepared.data,ContentType:'image/webp',CacheControl:'public, max-age=31536000, immutable'}));
   const url=imageUrl(bucket,region,key);const filename=file.name.replace(/[\u0000-\u001f]/g,'').slice(0,200)||'Product image';
   await client.query('INSERT INTO dt_media(bucket,object_key,url,filename,content_hash,width,height,bytes) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[bucket,key,url,filename,prepared.hash,prepared.width,prepared.height,prepared.data.length]);
   await client.query('COMMIT');return NextResponse.json({url,key,reused:false});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});throw e;}finally{client.release();}
 }catch(e){console.error('Media upload',e);return NextResponse.json({error:'Upload unavailable. Check bucket upload permissions and the media migration.'},{status:503});}
}
