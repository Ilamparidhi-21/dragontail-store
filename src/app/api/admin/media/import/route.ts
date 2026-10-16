import {NextRequest,NextResponse} from 'next/server';
import {authenticated} from '@/lib/auth';
import {safeMutation} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import {S3Client,ListObjectsV2Command,GetObjectCommand} from '@aws-sdk/client-s3';
import {mediaConfig,imageUrl,prepareImage,MAX_IMAGE_BYTES} from '@/lib/media';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!await authenticated()||!await safeMutation(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const input=await req.json().catch(()=>({}));const token=typeof input.cursor==='string'?input.cursor:undefined;
  if(token&&token.length>4096)return NextResponse.json({error:'Invalid cursor'},{status:400});
  const {bucket,region}=mediaConfig();const s3=new S3Client({region});
  const page=await s3.send(new ListObjectsV2Command({Bucket:bucket,Prefix:'products/',MaxKeys:20,ContinuationToken:token}));
  let imported=0,skipped=0;
  for(const object of page.Contents||[]){
   const key=object.Key;
   if(!key||! /\.(jpe?g|png|webp)$/i.test(key)||!object.Size||object.Size>MAX_IMAGE_BYTES){skipped++;continue;}
   if((await db.query('SELECT id FROM dt_media WHERE bucket=$1 AND object_key=$2',[bucket,key])).rowCount)continue;
   const result=await s3.send(new GetObjectCommand({Bucket:bucket,Key:key}));
   if(!result.Body||!result.ContentLength||result.ContentLength>MAX_IMAGE_BYTES){skipped++;continue;}
   let image:Awaited<ReturnType<typeof prepareImage>>;
   try{image=await prepareImage(Buffer.from(await result.Body.transformToByteArray()));}catch{skipped++;continue;}
   const inserted=await db.query('INSERT INTO dt_media(bucket,object_key,url,filename,content_hash,width,height,bytes) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',[bucket,key,imageUrl(bucket,region,key),key.split('/').pop()!.slice(0,200),image.hash,image.originalWidth,image.originalHeight,object.Size]);
   imported+=inserted.rowCount||0;
  }
  return NextResponse.json({imported,skipped,next:page.IsTruncated?page.NextContinuationToken:null});
 }catch(e){console.error('Media import',e);return NextResponse.json({error:'Import unavailable. Allow s3:ListBucket for products/ and s3:GetObject for products/* on the current bucket.'},{status:503});}
}
