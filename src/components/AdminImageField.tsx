'use client';
import {useEffect,useRef,useState} from 'react';
import AdminMediaPicker from './AdminMediaPicker';
import './admin-image-field.css';
export default function AdminImageField({label,value,onChange,onRemove,required=false,disabled=false,onBusyChange,allowLocal=false}:{label:string;value:string;onChange:(url:string)=>void;onRemove?:()=>void;required?:boolean;disabled?:boolean;onBusyChange?:(busy:boolean)=>void;allowLocal?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const request=useRef<AbortController|null>(null);
 useEffect(()=>()=>{request.current?.abort();},[]);
 const upload=async(file:File)=>{
  if(file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPG, PNG or WebP up to 5 MB.');return;}
  const controller=new AbortController();request.current=controller;setBusy(true);onBusyChange?.(true);setError('');
  try{const body=new FormData();body.append('image',file);const r=await fetch('/api/admin/media',{method:'POST',body,signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.error||'Upload failed');if(!controller.signal.aborted)onChange(data.url);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Upload failed');}finally{if(request.current===controller){setBusy(false);onBusyChange?.(false);request.current=null;}}
 };
 return <div className="dtImageField"><div className="dtImageFieldTitle"><strong>{label}{required?' *':' (optional)'}</strong>{onRemove&&<button type="button" disabled={disabled||busy} onClick={onRemove}>Remove photo</button>}</div>{value&&<a href={value} target="_blank" rel="noopener noreferrer" aria-label={'Preview '+label}><img src={value} alt={label} loading="lazy"/></a>}<label>{allowLocal?'IMAGE URL':'IMAGE HTTPS URL'}<input type={allowLocal?'text':'url'} required={required} value={value} disabled={disabled||busy} onChange={e=>onChange(e.target.value)} placeholder="Upload, select an existing image, or paste its URL"/></label><div className="dtImageActions"><label className="dtImageUpload">{busy?'Uploading…':'Upload new'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(f)void upload(f);}}/></label><AdminMediaPicker disabled={disabled||busy} onChoose={onChange}/></div>{error&&<p role="alert" className="dtImageError">{error}</p>}</div>;
}
