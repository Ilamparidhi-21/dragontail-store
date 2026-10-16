import {NextRequest,NextResponse} from 'next/server';
import {authenticated} from '@/lib/auth';
import {safeMutation} from '@/lib/customer-auth';
import {db} from '@/lib/db';
import {validColour} from '@/lib/colours';
export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!await authenticated()||!await safeMutation(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 const c=validColour(await req.json().catch(()=>null));if(!c)return NextResponse.json({error:'Enter a colour name (up to 50 characters) and a hex code such as #404B2C.'},{status:400});
 try{await db.query('INSERT INTO dt_colours(name,hex,sort_order) VALUES($1,$2,100) ON CONFLICT DO NOTHING',[c.name,c.hex]);const r=await db.query('SELECT name,hex FROM dt_colours WHERE LOWER(name)=LOWER($1)',[c.name]);const saved=r.rows[0];if(!saved||saved.hex!==c.hex)return NextResponse.json({error:'This name already has a different colour code. Choose a distinct name.'},{status:409});return NextResponse.json({colour:saved});}catch(e){console.error('Save colour',e);return NextResponse.json({error:'Cannot save colour. Check the colour migration.'},{status:503});}
}
