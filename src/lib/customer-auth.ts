import {cookies,headers} from 'next/headers';
import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {db} from '@/lib/db';
const scrypt=promisify(scryptCallback);
export const CUSTOMER_COOKIE='dt_customer';
export const customerCookieOptions={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/',maxAge:60*60*24*7};
export const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');
export const freshToken=()=>randomBytes(32).toString('hex');
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const hash=(await scrypt(password,salt,64)) as Buffer;return {salt,hash:hash.toString('hex')}}
export async function verifyPassword(password:string,salt:string,hash:string){const test=(await scrypt(password,salt,64)) as Buffer;const expected=Buffer.from(hash,'hex');return expected.length===test.length&&timingSafeEqual(expected,test)}
export async function currentCustomer(){const token=(await cookies()).get(CUSTOMER_COOKIE)?.value;if(!token||!/^[0-9a-f]{64}$/.test(token))return null;const res=await db.query('SELECT c.id,c.email,c.display_name AS "displayName" FROM dt_customer_sessions s JOIN dt_customers c ON c.id=s.customer_id WHERE s.token_hash=$1 AND s.expires_at>NOW() LIMIT 1',[hashToken(token)]);return res.rows[0]??null;}
// Reject cross-site modifications and plaintext HTTP credential submission.
export async function safeMutation(req:Request){const h=await headers();const proto=h.get('x-forwarded-proto')||new URL(req.url).protocol.replace(':','');if(proto!=='https'&&process.env.NODE_ENV==='production')return false;const origin=req.headers.get('origin');const host=h.get('x-forwarded-host')||h.get('host');if(!origin||!host)return false;try{const url=new URL(origin);return url.protocol==='https:'&&url.host===host}catch{return false}}
export const readText=(o:Record<string,unknown>,key:string,max:number)=>typeof o[key]==='string'?String(o[key]).trim().slice(0,max):'';
