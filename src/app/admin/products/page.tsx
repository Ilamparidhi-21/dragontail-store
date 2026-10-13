import {redirect} from 'next/navigation';
import {authenticated} from '@/lib/auth';
import ProductsClient from './ProductsClient';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (!(await authenticated())) redirect('/admin/login');
  return <ProductsClient/>;
}
