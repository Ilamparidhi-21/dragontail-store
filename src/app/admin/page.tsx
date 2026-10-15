import {redirect} from 'next/navigation';
import {authenticated} from '@/lib/auth';
export const dynamic='force-dynamic';
export default async function AdminHome(){
  redirect((await authenticated())?'/admin/overview':'/admin/login');
}
