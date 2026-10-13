import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {hashPassword,freshToken,hashToken,CUSTOMER_COOKIE,customerCookieOptions,safeMutation,readText} from '@/lib/customer-auth';
export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!await safeMutation(req))return NextResponse.json({error:'HTTPS and same-origin required'},{status:403});
 const body=await req.json().catch(()=>null);if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid request'},{status:400});
 const b=body as Record<string,unknown>;const email=readText(b,'email',254).toLowerCase(),name=readText(b,'name',100),password=b.password;
 if(!/^\S+@\S+\.\S+$/.test(email)||!name||typeof password!=='string'||password.length<12||password.length>128)return NextResponse.json({error:'Enter a valid email, name and password (12–128 characters)'},{status:400});
 try{const {salt,hash}=await hashPassword(password);const token=freshToken();const result=await db.query('INSERT INTO dt_customers(email,password_salt,password_hash,display_name) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id',[email,salt,hash,name]);if(!result.rowCount)return NextResponse.json({error:'Account already exists; please sign in'},{status:409});await db.query("INSERT INTO dt_customer_sessions(token_hash,customer_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[hashToken(token),result.rows[0].id]);const response=NextResponse.json({ok:true});response.cookies.set(CUSTOMER_COOKIE,token,customerCookieOptions);return response;}catch(e){console.error('Customer registration unavailable',e);return NextResponse.json({error:'Service temporarily unavailable'},{status:503})}
}
