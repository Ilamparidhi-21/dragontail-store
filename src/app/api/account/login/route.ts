import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {verifyPassword,freshToken,hashToken,CUSTOMER_COOKIE,customerCookieOptions,safeMutation,readText} from '@/lib/customer-auth';
export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!await safeMutation(req))return NextResponse.json({error:'HTTPS and same-origin required'},{status:403});
 const raw=await req.json().catch(()=>null);if(!raw||typeof raw!=='object')return NextResponse.json({error:'Invalid request'},{status:400});const b=raw as Record<string,unknown>;const email=readText(b,'email',254).toLowerCase(),password=b.password;
 if(!email||typeof password!=='string')return NextResponse.json({error:'Invalid credentials'},{status:401});
 try{const result=await db.query('SELECT id,password_salt,password_hash,locked_until FROM dt_customers WHERE email=$1',[email]);const c=result.rows[0];if(!c)return NextResponse.json({error:'Invalid credentials'},{status:401});if(c.locked_until&&new Date(c.locked_until)>new Date())return NextResponse.json({error:'Too many attempts. Try again later'},{status:429});
 const correct=await verifyPassword(password,c.password_salt,c.password_hash);if(!correct){await db.query("UPDATE dt_customers SET failed_logins=failed_logins+1,locked_until=CASE WHEN failed_logins+1>=5 THEN NOW()+INTERVAL '15 minutes' ELSE NULL END WHERE id=$1",[c.id]);return NextResponse.json({error:'Invalid credentials'},{status:401})}
 await db.query('UPDATE dt_customers SET failed_logins=0,locked_until=NULL WHERE id=$1',[c.id]);const token=freshToken();await db.query("INSERT INTO dt_customer_sessions(token_hash,customer_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[hashToken(token),c.id]);const response=NextResponse.json({ok:true});response.cookies.set(CUSTOMER_COOKIE,token,customerCookieOptions);return response;
 }catch(e){console.error('Customer sign-in unavailable',e);return NextResponse.json({error:'Service temporarily unavailable'},{status:503})}
}
