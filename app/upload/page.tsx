import FileUploadPage from '@/app/ClientPage';
import { getSettings } from '../admin/settings/actions';

export default async function UploadPage() {
    const settings = await getSettings();
    return <FileUploadPage settings={settings} />;
}