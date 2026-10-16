import sharp from 'sharp';
import {createHash} from 'node:crypto';
export const MAX_IMAGE_BYTES=5*1024*1024;
export function mediaConfig(){const bucket=process.env.DT_MEDIA_BUCKET;const region=process.env.DT_MEDIA_REGION||'ap-south-1';if(!bucket)throw new Error('Media bucket not configured');return {bucket,region};}
export function imageUrl(bucket:string,region:string,key:string){return `https://${bucket}.s3.${region}.amazonaws.com/${key.split('/').map(encodeURIComponent).join('/')}`;}
export async function prepareImage(body:Buffer){
 if(!body.length||body.length>MAX_IMAGE_BYTES)throw new Error('Choose an image up to 5 MB.');
 const image=sharp(body,{limitInputPixels:40_000_000});
 const meta=await image.metadata();
 if(!['jpeg','png','webp'].includes(meta.format||'')||(meta.pages||1)>1)throw new Error('Choose a still JPG, PNG or WebP image.');
 const {data,info}=await image.rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:85,effort:4}).toBuffer({resolveWithObject:true});
 return {data,width:info.width,height:info.height,originalWidth:meta.width,originalHeight:meta.height,hash:createHash('sha256').update(data).digest('hex')};
}
