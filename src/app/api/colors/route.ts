import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){try{const r=await db.query('SELECT name,hex FROM dt_colours ORDER BY sort_order,name LIMIT 500');return NextResponse.json({colours:r.rows},{headers:{'Cache-Control':'no-store'}});}catch(e){console.error('Colour palette',e);return NextResponse.json({error:'Colour palette unavailable'},{status:503});}}
