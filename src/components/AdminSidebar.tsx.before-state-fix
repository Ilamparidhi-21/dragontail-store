'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LayoutDashboard, ShoppingBag, Package, Layers3, ArrowUpRight, Users, BarChart3, Settings, X, ChevronDown, ChevronRight} from 'lucide-react';
import styles from '../app/admin/orders/orders.module.css';
import './sidebar.css';

type Section='orders'|'products'|'collections';
const storageKey='dt-admin-overview-expanded';
export default function AdminSidebar({active: _active,mobile,onClose,count}:{active:Section;mobile:boolean;onClose:()=>void;count?:number}) {
 const pathname=usePathname();
 const [expanded,setExpanded]=useState(true);
 useEffect(()=>{try{const value=window.localStorage.getItem(storageKey);if(value!==null)setExpanded(value==='true')}catch{}},[]);
 const toggle=()=>setExpanded(current=>{const next=!current;try{window.localStorage.setItem(storageKey,String(next))}catch{}return next});
 const sections=[{key:'orders',label:'Orders',href:'/admin/orders',Icon:ShoppingBag},{key:'products',label:'Products',href:'/admin/products',Icon:Package},{key:'collections',label:'Collections',href:'/admin/collections',Icon:Layers3}] as const;
 const selected=sections.find(section=>pathname===section.href || pathname.startsWith(section.href+'/'))?.key;
 return <aside className={`${styles.sidebar} ${mobile?styles.sidebarOpen:''}`}>
  <div className={styles.brand}>DRAGONTAIL <span>✦</span><button className={styles.closeMobile} onClick={onClose} aria-label="Close menu"><X size={19}/></button></div>
  <div className={styles.sideCaption}>COMMERCE MANAGER</div>
  <nav aria-label="Admin navigation">
   <button className={`${styles.navItem} dtSharedOverview`} type="button" aria-expanded={expanded} aria-controls="dt-management-links" onClick={toggle}><LayoutDashboard size={17}/>Overview <span className="dtSharedChevron" aria-hidden="true">{expanded?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</span></button>
   {expanded&&<div id="dt-management-links" className="dtSharedChildren">{sections.map(s=><Link key={s.key} href={s.href} aria-current={s.key===selected?'page':undefined} onClick={onClose} className={`${styles.navItem} ${s.key===selected?'dtSharedActive':''}`}><s.Icon size={17}/>{s.label}{s.key===selected&&count!==undefined&&<span className={styles.navCount}>{count}</span>}</Link>)}</div>}
   <Link className={styles.navItem} href="/" target="_blank" rel="noopener noreferrer" onClick={onClose}><ArrowUpRight size={17}/>Storefront</Link>
   <div className={styles.navDivider}/><div className={styles.navMuted}><Users size={17}/>Customers<small>SOON</small></div><div className={styles.navMuted}><BarChart3 size={17}/>Analytics<small>SOON</small></div><div className={styles.navMuted}><Settings size={17}/>Settings<small>SOON</small></div>
  </nav>
  <div className={styles.sideBottom}>DRAGONTAIL · DEVELOPMENT</div>
 </aside>;
}
