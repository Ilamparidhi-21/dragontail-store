'use client';
import ColourLabel from '@/components/ColourLabel';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Check,ChevronDown,LockKeyhole,MapPin,ShoppingBag,ShieldCheck} from 'lucide-react';
import styles from './checkout.module.css';
type CartLine={id:number;color:string;size:string;qty:number};
type Address={id:number;label:string;recipient:string;addressLine1:string;addressLine2:string;city:string;state:string;postalCode:string};
type Fields={recipient:string;address_line1:string;address_line2:string;city:string;state:string;postal_code:string};
type QuoteLine={id:number;name:string;image:string;color:string;size:string;qty:number;unitPrice:number;lineTotal:number};
type Quote={lines:QuoteLine[];subtotal:number;deliveryFee:number;total:number;notice:string};
const empty:Fields={recipient:'',address_line1:'',address_line2:'',city:'',state:'',postal_code:''};
const rupees=(v:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
export default function Checkout(){
 const [cart,setCart]=useState<CartLine[]>([]),[quote,setQuote]=useState<Quote|null>(null),[addresses,setAddresses]=useState<Address[]>([]),[selected,setSelected]=useState('new');
 const [form,setForm]=useState<Fields>(empty),[step,setStep]=useState<'address'|'review'|'complete'>('address');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[order,setOrder]=useState(''),[authNeeded,setAuthNeeded]=useState(false);
 useEffect(()=>{let alive=true;(async()=>{try{
  const raw=JSON.parse(localStorage.getItem('dt-cart')||'[]');const items:CartLine[]=Array.isArray(raw)?raw:[];
  if(!alive)return;setCart(items);
  if(!items.length){setError('Your shopping bag is empty.');return}
  const [profile,addr]=await Promise.all([fetch('/api/account/me',{cache:'no-store'}),fetch('/api/account/addresses',{cache:'no-store'})]);
  if(!profile.ok){setAuthNeeded(true);setError('Sign in to continue checkout.');return}
  if(addr.ok){const a=await addr.json();if(alive&&Array.isArray(a.addresses))setAddresses(a.addresses)}
  const response=await fetch('/api/checkout/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items}),cache:'no-store'});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to check your bag');if(alive)setQuote(result);
 }catch(e){if(alive)setError(e instanceof Error?e.message:'Checkout unavailable')}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[]);
 function chooseAddress(id:string){setSelected(id);if(id==='new'){setForm(empty);return}const a=addresses.find(x=>String(x.id)===id);if(a)setForm({recipient:a.recipient,address_line1:a.addressLine1,address_line2:a.addressLine2||'',city:a.city,state:a.state,postal_code:a.postalCode})}
 function review(e:React.FormEvent){e.preventDefault();setError('');if(!quote){setError('Stock and pricing could not be validated.');return}if(!/^\d{6}$/.test(form.postal_code)){setError('Enter a six-digit Indian PIN code.');return}setStep('review');window.scrollTo(0,0)}
 async function place(){if(busy||!quote)return;setBusy(true);setError('');try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,items:cart})});const result=await r.json();if(!r.ok)throw new Error(result.error||'Could not save request');setOrder(result.order.order_number);localStorage.removeItem('dt-cart');setStep('complete');window.scrollTo(0,0)}catch(e){setError(e instanceof Error?e.message:'Request failed')}finally{setBusy(false)}}
 return <main className={styles.page}>
 <header className={styles.top}><Link href="/" className={styles.brand}>DRAGONTAIL<span> ✦</span></Link><Link href="/" className={styles.back}><ArrowLeft size={16}/> RETURN TO STORE</Link></header>
 <div className={styles.progress}><span className={styles.current}>01 BAG</span><i/><span className={styles.current}>02 DELIVERY</span><i/><span className={step!=='address'?styles.current:''}>03 REVIEW</span><i/><span className={step==='complete'?styles.current:''}>04 REQUEST</span></div>
 <div className={styles.wrap}>
 <section className={styles.content}>
 <div className={styles.eyebrow}>DRAGONTAIL / PRIVATE CHECKOUT</div>
 {step==='complete'?<div className={styles.complete}><Check size={37}/><h1>Request received.</h1><p>Reference <strong>{order}</strong></p><p>Your request is saved, but it is <strong>not paid or confirmed</strong>. No payment has been collected, and stock has not been reserved. You can view its status in your account.</p><Link className={styles.button} href="/account/orders">VIEW MY REQUESTS <ArrowRight size={17}/></Link></div>:<>
 <h1>{step==='review'?'Review your request.':'The final details.'}</h1><p className={styles.intro}>A considered finish. Confirm your delivery details and review each piece before submitting.</p>
 {loading?<p role="status">Checking your account, inventory and current prices…</p>:null}
 {authNeeded?<div className={styles.alert}>Please <Link href="/account">sign in or create an account</Link> before continuing.</div>:null}
 {error?<div role="alert" className={styles.alert}>{error}</div>:null}
 {step==='address'?<form onSubmit={review} className={styles.form}>
 <div className={styles.sectionHeading}><MapPin size={20}/><h2>Delivery information</h2></div>
 {addresses.length>0?<div className={styles.saved}><label htmlFor="saved">Use a saved address</label><div className={styles.selectWrap}><select id="saved" value={selected} onChange={e=>chooseAddress(e.target.value)}><option value="new">Enter a new address</option>{addresses.map(a=><option key={a.id} value={String(a.id)}>{a.label} — {a.recipient}, {a.city}</option>)}</select><ChevronDown size={15}/></div></div>:null}
 <div className={styles.grid}>{([
 ['recipient','Full name','text'],['address_line1','Street address / building','text'],['address_line2','Apartment, floor, landmark (optional)','text'],['city','City','text'],['state','State','text'],['postal_code','PIN code','text']
 ] as [keyof Fields,string,string][]).map(([key,label,type])=><label key={key} className={key==='address_line1'||key==='address_line2'?styles.wide:''}>{label}<input type={type} required={key!=='address_line2'} maxLength={key==='postal_code'?6:180} inputMode={key==='postal_code'?'numeric':undefined} pattern={key==='postal_code'?'[0-9]{6}':undefined} value={form[key]} onChange={e=>setForm(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
 <div className={styles.note}><LockKeyhole size={18}/><span>Customer details are submitted over HTTPS. Payments are not yet available.</span></div>
 <button className={styles.button} disabled={loading||!quote||authNeeded} type="submit">CONTINUE TO REVIEW <ArrowRight size={17}/></button>
 </form>:<section className={styles.form}>
 <div className={styles.sectionHeading}><MapPin size={20}/><h2>Deliver to</h2></div><p>{form.recipient}<br/>{form.address_line1}{form.address_line2?', '+form.address_line2:''}<br/>{form.city}, {form.state} — {form.postal_code}</p><button className={styles.linkButton} onClick={()=>setStep('address')}>EDIT ADDRESS</button>
 <div className={styles.divider}/><div className={styles.sectionHeading}><ShieldCheck size={20}/><h2>Payment status</h2></div>
 <div className={styles.payment}><strong>Payment gateway not activated</strong><p>Razorpay integration will be enabled after account setup and verified webhooks. This action creates an <strong>unpaid order request</strong>; it does not charge you or guarantee fulfillment.</p></div>
 <button className={styles.button} disabled={busy} onClick={place}>{busy?'SUBMITTING…':'SUBMIT UNPAID REQUEST'} <ArrowRight size={17}/></button>
 </section>}
 </>}
 </section>
 <aside className={styles.summary}><div className={styles.sectionHeading}><ShoppingBag size={19}/><h2>Your selection</h2></div>
 {quote?quote.lines.map(line=><div className={styles.item} key={`${line.id}-${line.size}-${line.color}`}><div className={styles.image}>{line.image?<img src={line.image} alt={line.name}/>:null}</div><div><strong>{line.name}</strong><small><ColourLabel name={line.color}/> / {line.size} · QTY {line.qty}</small><strong>{rupees(line.lineTotal)}</strong></div></div>):<p className={styles.muted}>Your items appear here after inventory verification.</p>}
 <div className={styles.totals}><div><span>Subtotal</span><strong>{quote?rupees(quote.subtotal):'—'}</strong></div><div><span>Delivery</span><strong>{quote?rupees(quote.deliveryFee):'—'}</strong></div><div className={styles.total}><span>Total</span><strong>{quote?rupees(quote.total):'—'}</strong></div></div>
 <p className={styles.disclaimer}>{quote?.notice||'Amounts and availability will be confirmed by the server.'}</p><div className={styles.disclaimer}>No Razorpay payment can be made at this stage.</div></aside>
 </div></main>
}
