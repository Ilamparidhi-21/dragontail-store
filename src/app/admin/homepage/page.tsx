import {redirect} from 'next/navigation';
import {authenticated} from '@/lib/auth';
import HomepageClient from './HomepageClient';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authenticated())redirect('/admin/login');return <HomepageClient/>;}
