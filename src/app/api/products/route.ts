import {NextResponse} from 'next/server';
import {db} from '@/lib/db';

export const dynamic='force-dynamic';
export async function GET(){try{const result=await db.query(`SELECT details,id,name,category,type,price,image,alt_image AS "altImage",tag,colors,sizes,description,created_at AS "createdAt",color_images AS "colorImages", COALESCE((SELECT json_agg(json_build_object('color',i.color,'size',i.size,'quantity',i.quantity)) FROM dt_inventory i WHERE i.product_id=dt_products.id),'[]'::json) AS inventory FROM dt_products WHERE active = true AND deleted_at IS NULL ORDER BY id ASC LIMIT 300`);return NextResponse.json({products:result.rows,source:'database'},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('product database unavailable',e);return NextResponse.json({error:'Catalog temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})}}
