import {cookies} from 'next/headers';
import {createHmac, timingSafeEqual} from 'node:crypto';
const NAME='dt_admin';
function signature(payload:string){return createHmac('sha256',process.env.ADMIN_SESSION_SECRET||'not-configured').update(payload).digest('hex')}
export function createSession(){const expires=Date.now()+8*3600_000;const payload=String(expires);return `${payload}.${signature(payload)}`}
export async function authenticated(){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return false;const token=(await cookies()).get(NAME)?.value||'';const [stamp,sig]=token.split('.');if(!stamp||!sig||!/^\d+$/.test(stamp)||Number(stamp)<Date.now()||Number(stamp)>Date.now()+8*3600_000)return false;const expected=signature(stamp);return sig.length===expected.length&&timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}
export function cookieOptions(){return {httpOnly:true,secure:true,sameSite:'strict' as const,path:'/',maxAge:8*3600}}
export const cookieName=NAME;
