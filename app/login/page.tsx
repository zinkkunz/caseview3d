export const dynamic = 'force-dynamic';
import LoginForm from '@/components/auth/LoginForm';
import { getSettings } from '../admin/settings/actions';

export default async function LoginPage() {
  const settings = await getSettings();
  return <LoginForm settings={settings} />;
}
