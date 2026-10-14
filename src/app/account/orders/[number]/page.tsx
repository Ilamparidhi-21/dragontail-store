import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import styles from '../orders.module.css';
export const dynamic='force-dynamic';
type Item={name:string;color:string;size:string;quantity:number;unit_price:number;image:string|null};
type Order={order_number:string;created_at:string;status:string;payment_status:string;payment_provider:string;payment_reference:string|null;subtotal:number;delivery_fee:number;total:number;recipient:string;address_line1:string;address_line2:string;city:string;state:string;postal_code:string;carrier:string;tracking_number:string;items:Item[]};
const rupees=(n:number)=>'₹'+Number(n).toLocaleString('en-IN');
const label=(s:string)=>({awaiting_payment:'Awaiting payment',paid:'Payment confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled',refunded:'Refunded',unpaid:'Unpaid',pending:'Pending',failed:'Failed'} as Record<string,string>)[s]||s.replaceAll('_',' ');
export default async function OrderDetails({params}:{params:Promise<{number:string}>}){
 const user=await currentCustomer();if(!user)redirect('/account?mode=login');
 const {number}=await params;
 if(!/^DT-[A-Z0-9]{6,24}$/.test(number))notFound();
 const result=await db.query(`SELECT o.order_number,o.created_at,o.status,o.payment_status,o.payment_provider,o.payment_reference,o.subtotal,o.delivery_fee,o.total,o.recipient,o.address_line1,o.address_line2,o.city,o.state,o.postal_code,o.carrier,o.tracking_number,
 COALESCE((SELECT json_agg(json_build_object('name',i.name,'color',i.color,'size',i.size,'quantity',i.quantity,'unit_price',i.unit_price,'image',p.image) ORDER BY i.id) FROM dt_order_items i LEFT JOIN dt_products p ON p.id=i.product_id WHERE i.order_id=o.id),'[]'::json) AS items FROM dt_orders o WHERE o.customer_id=$1 AND o.order_number=$2 LIMIT 1`,[user.id,number]);
 if(!result.rows.length)notFound();const o=result.rows[0] as Order;
 const progress=['paid','processing','shipped','delivered']; const idx=progress.indexOf(o.status); const cancelled=o.status==='cancelled'||o.status==='refunded';
 return <main className={styles.page}><div className={styles.wrap}>
 <div className={styles.top}><Link href="/" className={styles.wordmark}>DRAGONTAIL ✦</Link><Link href="/account/orders" className={styles.back}>← ALL ORDERS</Link></div>
 <div className={styles.intro}><span className={styles.eyebrow}>YOUR ACCOUNT / ORDER DETAILS</span><h1>Order details<span className={styles.dot}>.</span></h1><p>Order {o.order_number} · Placed {new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p></div>
 <div className={styles.detailLayout}><div className={styles.detailMain}>
  <section className={styles.panel}><div className={styles.sectionTitle}><h2>Items ordered</h2><span>{o.items.reduce((n,x)=>n+x.quantity,0)} ITEMS</span></div>
  {o.items.map((i,n)=><div className={styles.lineItem} key={n}><div className={styles.detailThumb}>{i.image?<img src={i.image} alt={i.name}/>:<span>DT</span>}</div><div className={styles.lineInfo}><strong>{i.name}</strong><p>{i.color} / {i.size}</p><p>Quantity: {i.quantity}</p></div><strong>{rupees(i.unit_price*i.quantity)}</strong></div>)}
  <div className={styles.totals}><div><span>Subtotal</span><strong>{rupees(o.subtotal)}</strong></div><div><span>Delivery</span><strong>{o.delivery_fee===0?'Free':rupees(o.delivery_fee)}</strong></div><div className={styles.grand}><span>Total</span><strong>{rupees(o.total)}</strong></div></div></section>
  <section className={styles.panel}><div className={styles.sectionTitle}><h2>Order progress</h2><span className={styles.status} data-state={o.status}>{label(o.status)}</span></div>
   {cancelled?<p className={styles.infoText}>This order is {label(o.status).toLowerCase()}. No further delivery progress is scheduled.</p>:idx===-1?<p className={styles.infoText}>Order request received. Payment has not yet been verified, so fulfilment has not started.</p>:<ol className={styles.timeline}>{progress.map((s,k)=><li key={s} className={k<=idx?styles.done:''}><span className={styles.timelineDot}/><div><strong>{label(s)}</strong>{k===idx?<p>Current status</p>:null}</div></li>)}</ol>}
  </section>
 </div><aside className={styles.detailAside}>
  <section className={styles.panel}><div className={styles.sectionTitle}><h2>Delivery address</h2></div><p className={styles.address}><strong>{o.recipient}</strong>{o.address_line1}{o.address_line2?<>{o.address_line2}</>:null}{o.city}, {o.state} – {o.postal_code}</p></section>
  <section className={styles.panel}><div className={styles.sectionTitle}><h2>Payment</h2></div><div className={styles.metaRow}><span>Status</span><strong>{label(o.payment_status)}</strong></div><div className={styles.metaRow}><span>Method</span><strong>{o.payment_provider==='not_configured'?'Not available yet':o.payment_provider}</strong></div>{o.payment_status!=='paid'?<p className={styles.infoText}>This is an unpaid order request, not a confirmed purchase.</p>:null}</section>
  <section className={styles.panel}><div className={styles.sectionTitle}><h2>Delivery & tracking</h2></div><div className={styles.metaRow}><span>Courier</span><strong>{o.carrier||'Not assigned'}</strong></div><div className={styles.metaRow}><span>Tracking ID</span><strong className={styles.break}>{o.tracking_number||'Not yet available'}</strong></div><div className={styles.metaRow}><span>Order status</span><strong>{label(o.status)}</strong></div></section>
 </aside></div><Link href="/account/orders" className={styles.bottomBack}>← BACK TO MY ORDERS</Link>
 </div></main>;
}
