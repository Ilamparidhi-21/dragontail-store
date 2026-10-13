import {NextResponse} from 'next/server';
import {currentCustomer} from '@/lib/customer-auth';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await currentCustomer();return NextResponse.json({user},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Unavailable'},{status:503})}}
