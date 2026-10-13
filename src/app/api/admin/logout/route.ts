import {NextResponse} from 'next/server';
import {cookieName,cookieOptions} from '@/lib/auth';
export async function POST(){const res=NextResponse.json({ok:true});res.cookies.set(cookieName,'',{...cookieOptions(),maxAge:0});return res}
