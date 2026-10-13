'use client';
import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
export default function AdminLogin(){
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const router=useRouter();
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try {
   const r=await fetch('/api/admin/login',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
   if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error||'Sign in failed');}
   setPassword('');router.replace('/admin/orders');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Sign in failed');}finally{setBusy(false);}
 }
 return <main style={{minHeight:'100vh',background:'#f7f8f9',color:'#171717',display:'grid',placeItems:'center',padding:24}}><section style={{background:'white',border:'1px solid #e5e5e5',padding:'min(7vw,48px)',width:'min(100%,460px)'}}>
 <div style={{fontWeight:700,letterSpacing:4,fontSize:18}}>DRAGONTAIL ✦</div>
 <p style={{fontSize:11,letterSpacing:3,color:'#666',marginTop:14}}>COMMERCE MANAGER</p>
 <h1 style={{fontWeight:500,fontSize:32,margin:'36px 0 10px'}}>Administrator sign in</h1>
 <p style={{fontSize:13,color:'#666',lineHeight:1.6}}>Access the Orders and Products dashboard.</p>
 <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:30}}>
 <label style={{display:'grid',gap:8,fontSize:12}}>ADMIN PASSWORD<input aria-label="Admin password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required style={{height:46,border:'1px solid #ccc',padding:'0 12px',background:'#fff',color:'#111'}}/></label>
 {error&&<p role="alert" style={{color:'#b42318',fontSize:13}}>{error}</p>}
 <button disabled={busy} type="submit" style={{height:48,background:'#171717',color:'#fff',border:0,cursor:'pointer',fontWeight:600}}>{busy?'SIGNING IN…':'SIGN IN'}</button></form></section></main>;
}
