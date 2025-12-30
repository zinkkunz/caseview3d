import DropboxHero from '@/components/landing/DropboxHero';
import DropboxPricing from '@/components/landing/DropboxPricing';

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-white'>
      <DropboxHero />
      <DropboxPricing />
    </main>
  );
}