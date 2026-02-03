import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('canneo_admin_token');

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
