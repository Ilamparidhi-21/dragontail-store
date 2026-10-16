'use client';
import {useEffect,useState} from 'react';
import {PRESET_COLOURS,type Colour} from '@/lib/colours';
let cache:Colour[]=PRESET_COLOURS;let inflight:Promise<void>|null=null;let loaded=false;const listeners=new Set<(v:Colour[])=>void>();
export function refreshColours(){if(inflight)return inflight;inflight=fetch('/api/colors',{cache:'no-store'}).then(async r=>{const data=await r.json();if(!r.ok||!Array.isArray(data.colours))throw Error('Colour palette unavailable');cache=data.colours;loaded=true;listeners.forEach(fn=>fn(cache));}).finally(()=>{inflight=null;});return inflight;}
export default function useColours(){const [colours,setColours]=useState(cache);useEffect(()=>{listeners.add(setColours);setColours(cache);if(!loaded)void refreshColours().catch(()=>{});return()=>{listeners.delete(setColours);};},[]);return colours;}
