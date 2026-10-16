'use client';
import AdminImageField from './AdminImageField';
export default function AdminVariantImages({color,images,onChange,disabled,onBusyChange,fallback}:{color:string;images:string[];onChange:(images:string[])=>void;disabled:boolean;onBusyChange:(busy:boolean)=>void;fallback?:string}){
 const rows=images.length?images:[fallback||''];
 return <div className="dtExtraPhotos"><p>Main photo is required for each color. Add up to 7 extra photos; all extra photos are optional.{fallback?' This first color can use the main product photo.':''}</p>{rows.map((url,index)=><AdminImageField key={color+':'+index} label={index===0?'Main variant photo':`Variant photo ${index+1}`} value={url} required={index===0&&!fallback} disabled={disabled} onBusyChange={onBusyChange} onChange={value=>{const next=[...rows];next[index]=value;onChange(next);}} onRemove={index>0?()=>onChange(rows.filter((_,i)=>i!==index)):undefined}/>)}<button type="button" className="dtAddPhoto" disabled={disabled||rows.length>=8} onClick={()=>onChange([...rows,''])}>{rows.length>=8?'Maximum 8 photos':'+ Add another photo'}</button></div>;
}
