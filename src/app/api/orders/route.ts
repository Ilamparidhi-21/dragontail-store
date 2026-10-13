import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {currentCustomer,safeMutation} from '@/lib/customer-auth';
import {notifyNewOrder} from '@/lib/order-mail';
import {randomUUID} from 'node:crypto';
export const dynamic='force-dynamic';
export async function GET(){const user=await currentCustomer();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});const r=await db.query('SELECT id,order_number,status,payment_status,total,tracking_number,created_at FROM dt_orders WHERE customer_id=$1 ORDER BY id DESC LIMIT 100',[user.id]);return NextResponse.json({orders:r.rows})}
export async function POST(req:NextRequest){
 if(!await safeMutation(req))return NextResponse.json({error:'HTTPS and same-origin required'},{status:403});
 const user=await currentCustomer();if(!user)return NextResponse.json({error:'Please sign in first'},{status:401});
 if(process.env.ENABLE_ORDER_REQUESTS!=='true')return NextResponse.json({error:'Order requests not enabled yet'},{status:503});
 const raw=await req.json().catch(()=>null);if(!raw||!Array.isArray(raw.items)||raw.items.length<1||raw.items.length>30)return NextResponse.json({error:'Invalid cart'},{status:400});
 const v=(k:string,max:number)=>typeof raw[k]==='string'?raw[k].trim().slice(0,max):'';
 const recipient=v('recipient',100),address=v('address_line1',180),address2=v('address_line2',180),city=v('city',90),state=v('state',90),postal=v('postal_code',12);
 if(!recipient||!address||!city||!state||!/^[0-9]{6}$/.test(postal))return NextResponse.json({error:'Complete Indian delivery address required'},{status:400});
 const items=raw.items.map((x:Record<string,unknown>)=>({id:Number(x.id),color:String(x.color||''),size:String(x.size||''),qty:Number(x.qty)}));
 if(items.some((x:{id:number;color:string;size:string;qty:number})=>!Number.isSafeInteger(x.id)||x.id<1||!x.color||!x.size||!Number.isInteger(x.qty)||x.qty<1||x.qty>20))return NextResponse.json({error:'Invalid item quantities'},{status:400});
 const unique=new Set(items.map((x:{id:number;color:string;size:string})=>JSON.stringify([x.id,x.color,x.size])));if(unique.size!==items.length)return NextResponse.json({error:'Duplicate cart variants'},{status:400});
 const conn=await db.connect();let order:{id:number;order_number:string;email:string;total:number}|null=null;
 try{await conn.query('BEGIN');await conn.query("SET LOCAL lock_timeout = '3s'");
 let subtotal=0;const lines: {id:number;name:string;color:string;size:string;qty:number;price:number}[]=[];
 for(const x of items){const r=await conn.query(`SELECT p.id,p.name,p.price,i.quantity FROM dt_products p JOIN dt_inventory i ON i.product_id=p.id AND i.color=$2 AND i.size=$3 WHERE p.id=$1 AND p.active=true`,[x.id,x.color,x.size]);if(!r.rows.length||Number(r.rows[0].quantity)<x.qty){await conn.query('ROLLBACK');return NextResponse.json({error:`Unavailable stock: ${x.color} / ${x.size}`},{status:409})}const p=r.rows[0];subtotal+=Number(p.price)*x.qty;lines.push({...x,name:p.name,price:Number(p.price)})}
 const fee=subtotal>=4999?0:0; // shipping not charged until policy is finalized
 const orderNumber='DT-'+randomUUID().replace(/-/g,'').slice(0,12).toUpperCase();
 const saved=await conn.query(`INSERT INTO dt_orders(customer_id,order_number,subtotal,delivery_fee,total,recipient,email,address_line1,address_line2,city,state,postal_code) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id,order_number,total`,[user.id,orderNumber,subtotal,fee,subtotal+fee,recipient,user.email,address,address2,city,state,postal]);
 for(const x of lines)await conn.query('INSERT INTO dt_order_items(order_id,product_id,name,color,size,quantity,unit_price) VALUES($1,$2,$3,$4,$5,$6,$7)',[saved.rows[0].id,x.id,x.name,x.color,x.size,x.qty,x.price]);
 await conn.query('COMMIT');order={...saved.rows[0],email:user.email};
 }catch(e){await conn.query('ROLLBACK').catch(()=>{});console.error('Create order error',e);return NextResponse.json({error:'Could not save order'},{status:503})}finally{conn.release()}
 if(order)await notifyNewOrder(order);
 return NextResponse.json({order,notice:'Order request saved. Payment has NOT been made. Stock is not reserved.'},{status:201});
}
