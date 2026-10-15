import {authenticated} from '@/lib/auth';
import {redirect} from 'next/navigation';
import Overview from './Overview';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authenticated())redirect('/admin/login');return <Overview/>;}
