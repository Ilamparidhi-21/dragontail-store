'use client';
import useColours from './useColours';
import {colourHex} from '@/lib/colours';
export default function ColourLabel({name,dotOnly=false}:{name:string;dotOnly?:boolean}){const colours=useColours();return <span style={{display:'inline-flex',alignItems:'center',gap:7,verticalAlign:'middle'}}><span aria-hidden="true" style={{display:'inline-block',width:16,height:16,border:'1px solid #999',borderRadius:'50%',backgroundColor:colourHex(name,colours),flexShrink:0}}/>{!dotOnly&&name}</span>;}
