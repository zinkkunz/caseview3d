'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateSettings(updates: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    revalidatePath('/admin/settings');
    revalidatePath('/'); // For branding
    return { success: true };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { success: false, error: '설정 업데이트에 실패했습니다.' };
  }
}

export async function triggerCleanup() {
  try {
    const settings = await getSettings();
    const expiryDays = parseInt(settings['case_expiry_days'] || '30');
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - expiryDays);

    const deletedCases = await prisma.case.deleteMany({
      where: {
        createdAt: {
          lt: expiryDate
        },
      }
    });

    revalidatePath('/admin/cases');
    return { success: true, count: deletedCases.count };
  } catch (error) {
    console.error('Cleanup failed:', error);
    return { success: false };
  }
}
