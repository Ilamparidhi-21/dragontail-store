import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 const v=await req.json().catch(()=>null);
 const id=Number(v?.productId),quantity=Number(v?.quantity);
 if(!Number.isSafeInteger(id)||id<1||(v?.size!==undefined&&typeof v.size!=='string')||typeof v?.color!=='string'||String(v?.size||'').length>40||v.color.length>60||!Number.isSafeInteger(quantity)||quantity<1||quantity>100)
  return NextResponse.json({error:'Invalid selection'},{status:400});
 try{
  const r=await db.query(`SELECT i.quantity FROM dt_inventory i JOIN dt_products p ON p.id=i.product_id
   WHERE p.id=$1 AND p.active=true AND i.size=CASE WHEN p.category='Accessories' AND p.sizes=ARRAY['ONE SIZE']::text[] THEN 'ONE SIZE' ELSE $2 END AND i.color=$3`,[id,v.size||'',v.color]);
  const available=r.rows[0]?.quantity??0;
  return NextResponse.json({available,ok:available>=quantity},{status:available>=quantity?200:409,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Inventory unavailable'},{status:503})}
}
