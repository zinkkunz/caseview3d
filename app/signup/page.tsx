import SignupForm from '@/components/auth/SignupForm';
import { getSettings } from '../admin/settings/actions';

export default async function SignupPage() {
  const settings = await getSettings();
  return <SignupForm settings={settings} />;
}
