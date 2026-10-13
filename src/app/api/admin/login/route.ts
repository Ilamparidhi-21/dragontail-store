import {NextRequest,NextResponse} from 'next/server';
import {scryptSync,randomBytes,timingSafeEqual} from 'node:crypto';
import {createSession,cookieName,cookieOptions} from '@/lib/auth';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(req.headers.get('x-forwarded-proto')!=='https'&&req.nextUrl.protocol!=='https:')return NextResponse.json({error:'HTTPS is required for admin login'},{status:403});
 const hash=process.env.ADMIN_PASSWORD_SCRYPT;const secret=process.env.ADMIN_SESSION_SECRET;
 if(!hash||!secret||secret.length<32)return NextResponse.json({error:'Admin is not configured'},{status:503});
 try {const {password}=await req.json();if(typeof password!=='string'||password.length>1024)return NextResponse.json({error:'Invalid credentials'},{status:401});const [salt,expectedHex]=hash.split(':');if(!salt||!expectedHex||expectedHex.length!==128)return NextResponse.json({error:'Admin configuration invalid'},{status:503});const supplied=scryptSync(password,salt,64);const expected=Buffer.from(expectedHex,'hex');if(expected.length!==64||!timingSafeEqual(supplied,expected))return NextResponse.json({error:'Invalid credentials'},{status:401});const res=NextResponse.json({ok:true});res.cookies.set(cookieName,createSession(),cookieOptions());return res}catch{return NextResponse.json({error:'Invalid credentials'},{status:401})}
}
