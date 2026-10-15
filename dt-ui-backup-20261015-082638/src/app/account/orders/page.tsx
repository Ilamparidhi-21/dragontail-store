import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import styles from './orders.module.css';
export const dynamic='force-dynamic';

type Item={name:string;color:string;size:string;quantity:number;unit_price:number;image:string|null};
type Order={order_number:string;total:number;payment_status:string;status:string;created_at:string;items:Item[]};
const rupees=(n:number)=>'₹'+Number(n).toLocaleString('en-IN');
const statusText=(s:string)=>({awaiting_payment:'Awaiting payment',paid:'Payment confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled',refunded:'Refunded'} as Record<string,string>)[s]||s.replaceAll('_',' ');
export default async function OrdersPage(){
 const customer=await currentCustomer();if(!customer)redirect('/account?mode=login');
 const result=await db.query(`SELECT o.order_number,o.total,o.payment_status,o.status,o.created_at,
 COALESCE((SELECT json_agg(json_build_object('name',i.name,'color',i.color,'size',i.size,'quantity',i.quantity,'unit_price',i.unit_price,'image',p.image) ORDER BY i.id) FROM dt_order_items i LEFT JOIN dt_products p ON p.id=i.product_id WHERE i.order_id=o.id),'[]'::json) AS items
 FROM dt_orders o WHERE o.customer_id=$1 ORDER BY o.created_at DESC LIMIT 100`,[customer.id]);
 const orders=result.rows as Order[];
 return <main className={styles.page}><div className={styles.wrap}>
  <div className={styles.top}><Link href="/" className={styles.wordmark}>DRAGONTAIL ✦</Link><Link href="/" className={styles.back}>← BACK TO STORE</Link></div>
  <div className={styles.intro}><span className={styles.eyebrow}>YOUR ACCOUNT / ORDER HISTORY</span><h1>My orders<span className={styles.dot}>.</span></h1><p>Every piece, every detail. Find your purchases and delivery updates here.</p></div>
  <div className={styles.listHead}><span>{orders.length} {orders.length===1?'ORDER':'ORDERS'}</span><span>RECENT FIRST</span></div>
  {orders.length===0?<section className={styles.empty}><h2>Nothing here yet.</h2><p>Your orders will appear here once you place one.</p><Link className={styles.darkButton} href="/">EXPLORE THE COLLECTION →</Link></section>:
  <div className={styles.list}>{orders.map(o=><Link className={styles.card} key={o.order_number} href={'/account/orders/'+encodeURIComponent(o.order_number)}>
    <div className={styles.cardTop}><div><span className={styles.eyebrow}>ORDER {o.order_number}</span><p className={styles.date}>{new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p></div><span className={styles.status} data-state={o.status}>{statusText(o.status)}</span></div>
    <div className={styles.cardBody}><div className={styles.gallery}>{o.items.slice(0,3).map((p,index)=><div className={styles.thumb} key={index}>{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<span>DT</span>}</div>)}</div>
    <div className={styles.productInfo}><strong>{o.items[0]?.name||'Order details'}</strong><p>{o.items[0]?`${o.items[0].color} / ${o.items[0].size} · Qty ${o.items[0].quantity}`:''}{o.items.length>1?` · +${o.items.length-1} more`:''}</p><p className={styles.pay}>Payment: {o.payment_status}</p></div>
    <div className={styles.cardEnd}><strong>{rupees(o.total)}</strong><span>VIEW DETAILS ↗</span></div></div>
  </Link>)}</div>}
 </div></main>;
}
