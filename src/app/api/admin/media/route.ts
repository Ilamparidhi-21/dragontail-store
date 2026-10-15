import { NextRequest, NextResponse } from 'next/server';
import { authenticated } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const MAX=5*1024*1024;
function validSignature(type:string, bytes:Buffer){
 if(type==='image/jpeg')return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(type==='image/png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(type==='image/webp')return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 return false;
}
export async function POST(req:NextRequest){
 if(!(await authenticated()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const bucket=process.env.DT_MEDIA_BUCKET,region=process.env.DT_MEDIA_REGION||'ap-south-1';
 if(!bucket)return NextResponse.json({error:'Media bucket not configured'},{status:503});
 const declared=Number(req.headers.get('content-length')||'0');
 if(declared>MAX+100000)return NextResponse.json({error:'Image exceeds 5 MB limit'},{status:413});
 try{
  const data=await req.formData();const file=data.get('image');
  if(!(file instanceof File))return NextResponse.json({error:'Missing image'},{status:400});
  if(file.size===0||file.size>MAX)return NextResponse.json({error:'Image exceeds 5 MB limit'},{status:413});
  const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  if(!extensions[file.type])return NextResponse.json({error:'Only JPG, PNG or WebP images allowed'},{status:415});
  const body=Buffer.from(await file.arrayBuffer());
  if(!validSignature(file.type,body))return NextResponse.json({error:'Invalid image content'},{status:415});
  const key=`products/${randomUUID()}.${extensions[file.type]}`;
  await new S3Client({region}).send(new PutObjectCommand({Bucket:bucket,Key:key,Body:body,ContentType:file.type,CacheControl:'public, max-age=31536000, immutable'}));
  const url=`https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return NextResponse.json({url,key});
 }catch(e){console.error('Media upload error',e);return NextResponse.json({error:'Upload unavailable'},{status:503})}
}
