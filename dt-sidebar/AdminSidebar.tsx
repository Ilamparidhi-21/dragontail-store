'use client';
import {useState} from 'react';
import Link from 'next/link';
import {LayoutDashboard, ShoppingBag, Package, Layers3, ArrowUpRight, Users, BarChart3, Settings, X} from 'lucide-react';
import styles from '../orders/orders.module.css';
import './sidebar.css';

type Section='orders'|'products'|'collections';
export default function AdminSidebar({active,mobile,onClose,count}:{active:Section;mobile:boolean;onClose:()=>void;count?:number}) {
 const [expanded,setExpanded]=useState(true);
 const sections=[{key:'orders',label:'Orders',href:'/admin/orders',Icon:ShoppingBag},{key:'products',label:'Products',href:'/admin/products',Icon:Package},{key:'collections',label:'Collections',href:'/admin/collections',Icon:Layers3}] as const;
 return <aside className={`${styles.sidebar} ${mobile?styles.sidebarOpen:''}`}>
  <div className={styles.brand}>DRAGONTAIL <span>✦</span><button className={styles.closeMobile} onClick={onClose} aria-label="Close menu"><X size={19}/></button></div>
  <div className={styles.sideCaption}>COMMERCE MANAGER</div>
  <nav aria-label="Admin navigation">
   <button className={`${styles.navItem} dtSharedOverview`} type="button" aria-expanded={expanded} aria-controls="dt-management-links" onClick={()=>setExpanded(v=>!v)}><LayoutDashboard size={17}/>Overview <span className="dtSharedChevron" aria-hidden="true">{expanded?'−':'+'}</span></button>
   {expanded&&<div id="dt-management-links" className="dtSharedChildren">{sections.map(s=><Link key={s.key} href={s.href} aria-current={s.key===active?'page':undefined} onClick={onClose} className={`${styles.navItem} ${s.key===active?'dtSharedActive':''}`}><s.Icon size={17}/>{s.label}{s.key===active&&count!==undefined&&<span className={styles.navCount}>{count}</span>}</Link>)}</div>}
   <Link className={styles.navItem} href="/" target="_blank" rel="noopener noreferrer" onClick={onClose}><ArrowUpRight size={17}/>Storefront</Link>
   <div className={styles.navDivider}/><div className={styles.navMuted}><Users size={17}/>Customers<small>SOON</small></div><div className={styles.navMuted}><BarChart3 size={17}/>Analytics<small>SOON</small></div><div className={styles.navMuted}><Settings size={17}/>Settings<small>SOON</small></div>
  </nav>
  <div className={styles.sideBottom}>DRAGONTAIL · DEVELOPMENT</div>
 </aside>;
}
