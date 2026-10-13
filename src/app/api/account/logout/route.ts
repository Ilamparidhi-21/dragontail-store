import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {db} from '@/lib/db';
import {CUSTOMER_COOKIE,hashToken,safeMutation,customerCookieOptions} from '@/lib/customer-auth';
export async function POST(req:NextRequest){if(!await safeMutation(req))return NextResponse.json({error:'Forbidden'},{status:403});const token=(await cookies()).get(CUSTOMER_COOKIE)?.value;try{if(token)await db.query('DELETE FROM dt_customer_sessions WHERE token_hash=$1',[hashToken(token)])}catch{}const r=NextResponse.json({ok:true});r.cookies.set(CUSTOMER_COOKIE,'',{...customerCookieOptions,maxAge:0});return r}
