import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {authenticated} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function PUT(req:NextRequest){
 if(!await authenticated())return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>null);
 const productId=Number(body?.productId);
 if(!Number.isSafeInteger(productId)||productId<1||!Array.isArray(body?.variants)||body.variants.length>180)
  return NextResponse.json({error:'Invalid inventory payload'},{status:400});
 const client=await db.connect().catch(()=>null);
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 try{
  await client.query('BEGIN');
  const product=await client.query('SELECT colors,sizes FROM dt_products WHERE id=$1 FOR UPDATE',[productId]);
  if(!product.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Product not found'},{status:404})}
  const {colors,sizes}=product.rows[0] as {colors:string[];sizes:string[]};
  const expected=new Set(colors.flatMap(c=>sizes.map(s=>JSON.stringify([c,s]))));
  const seen=new Set<string>();
  if(body.variants.length!==expected.size)throw new Error('Submit all product variants');
  for(const v of body.variants){
   const key=JSON.stringify([v?.color,v?.size]);
   if(!expected.has(key)||seen.has(key)||!Number.isSafeInteger(v.quantity)||v.quantity<0||v.quantity>1000000)
    throw new Error('Invalid variant or stock quantity');
   seen.add(key);
   await client.query(`INSERT INTO dt_inventory(product_id,color,size,quantity,updated_at)
    VALUES ($1,$2,$3,$4,NOW()) ON CONFLICT(product_id,color,size)
    DO UPDATE SET quantity=EXCLUDED.quantity,updated_at=NOW()`,[productId,v.color,v.size,v.quantity]);
  }
  await client.query('DELETE FROM dt_inventory WHERE product_id=$1 AND NOT (color=ANY($2::text[]) AND size=ANY($3::text[]))',[productId,colors,sizes]);
  await client.query('COMMIT');
  return NextResponse.json({ok:true});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:e instanceof Error?e.message:'Stock update failed'},{status:400})}
 finally{client.release()}
}
