import {NextRequest,NextResponse} from 'next/server';
import {authenticated} from '@/lib/auth';
import {safeMutation} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import {cleanHomeImages,resolveHomeImages} from '@/lib/homepage-images';
export const dynamic='force-dynamic';
export async function GET(){if(!await authenticated())return NextResponse.json({error:'Unauthorized'},{status:401});try{const r=await db.query('SELECT images FROM dt_homepage_images WHERE id=1');return NextResponse.json({images:resolveHomeImages(r.rows[0]?.images)},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Homepage images unavailable. Check the migration.'},{status:503});}}
export async function PUT(req:NextRequest){if(!await authenticated()||!await safeMutation(req))return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>null);const images=cleanHomeImages(body?.images);if(!images)return NextResponse.json({error:'Each image needs an HTTPS URL or a valid /images/ file path.'},{status:400});try{await db.query('INSERT INTO dt_homepage_images(id,images,updated_at) VALUES(1,$1::jsonb,NOW()) ON CONFLICT(id) DO UPDATE SET images=EXCLUDED.images,updated_at=NOW()',[JSON.stringify(images)]);return NextResponse.json({ok:true,images});}catch(e){console.error('Save homepage',e);return NextResponse.json({error:'Cannot save homepage images.'},{status:503});}}
