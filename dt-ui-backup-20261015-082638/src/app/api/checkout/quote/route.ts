import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {currentCustomer,safeMutation} from '@/lib/customer-auth';
export const dynamic='force-dynamic';
type CartLine={id:number;color:string;size:string;qty:number};
export async function POST(req:NextRequest){
 if(!await safeMutation(req))return NextResponse.json({error:'HTTPS and same-origin required'},{status:403});
 if(!await currentCustomer())return NextResponse.json({error:'Sign in to continue'},{status:401});
 const body=await req.json().catch(()=>null);
 if(!body||!Array.isArray(body.items)||!body.items.length||body.items.length>30)return NextResponse.json({error:'Your bag is empty or invalid'},{status:400});
 const items:CartLine[]=body.items.map((v:Record<string,unknown>)=>({id:Number(v?.id),color:String(v?.color||''),size:String(v?.size||''),qty:Number(v?.qty)}));
 if(items.some(x=>!Number.isSafeInteger(x.id)||x.id<1||!x.color||!x.size||!Number.isInteger(x.qty)||x.qty<1||x.qty>20))return NextResponse.json({error:'Invalid bag selection'},{status:400});
 if(new Set(items.map(x=>JSON.stringify([x.id,x.color,x.size]))).size!==items.length)return NextResponse.json({error:'Duplicate bag variant'},{status:400});
 try{
  const lines=[];let subtotal=0;
  for(const x of items){
   const r=await db.query('SELECT p.id,p.name,p.price,p.image,i.quantity AS stock FROM dt_products p JOIN dt_inventory i ON i.product_id=p.id AND i.color=$2 AND i.size=$3 WHERE p.id=$1 AND p.active=true',[x.id,x.color,x.size]);
   if(!r.rows.length)return NextResponse.json({error:`Unavailable: ${x.color} / ${x.size}`},{status:409});
   const p=r.rows[0];if(Number(p.stock)<x.qty)return NextResponse.json({error:`Only ${p.stock} unit(s) left: ${p.name} ${x.color} / ${x.size}`},{status:409});
   subtotal+=Number(p.price)*x.qty;
   lines.push({id:p.id,name:p.name,image:p.image,color:x.color,size:x.size,qty:x.qty,unitPrice:Number(p.price),lineTotal:Number(p.price)*x.qty});
  }
  return NextResponse.json({lines,subtotal,deliveryFee:0,total:subtotal,notice:'Delivery fee is currently ₹0 while shipping policy is being finalized. No payment is collected.'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Checkout quote unavailable',e);return NextResponse.json({error:'Unable to validate prices and stock'},{status:503})}
}
