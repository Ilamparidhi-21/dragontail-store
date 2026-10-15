import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){
 try {const {rows}=await db.query(`SELECT c.id,c.name,c.slug,c.description,c.cover_image AS "coverImage",c.sort_order AS "sortOrder", CASE WHEN c.slug='new-arrivals' THEN ARRAY(SELECT np.id FROM dt_products np WHERE np.active AND np.deleted_at IS NULL AND np.created_at>=NOW()-INTERVAL '30 days' ORDER BY np.id) ELSE COALESCE(array_agg(cp.product_id ORDER BY cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL AND p.active AND p.deleted_at IS NULL),ARRAY[]::integer[]) END AS "productIds" FROM dt_collections c LEFT JOIN dt_collection_products cp ON cp.collection_id=c.id LEFT JOIN dt_products p ON p.id=cp.product_id WHERE c.active=true GROUP BY c.id ORDER BY c.sort_order,c.id`);return NextResponse.json({collections:rows},{headers:{'Cache-Control':'no-store'}})}
 catch(e){console.error('collections unavailable',e);return NextResponse.json({error:'Collections unavailable'},{status:503})}
}
