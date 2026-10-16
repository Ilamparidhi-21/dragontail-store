import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {resolveHomeImages} from '@/lib/homepage-images';
export const dynamic='force-dynamic';
export async function GET(){try{const r=await db.query('SELECT images FROM dt_homepage_images WHERE id=1');return NextResponse.json({images:resolveHomeImages(r.rows[0]?.images)},{headers:{'Cache-Control':'no-store'}});}catch(e){console.error('Homepage images',e);return NextResponse.json({error:'Homepage images unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}}
