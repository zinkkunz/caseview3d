export const dynamic = 'force-dynamic';
﻿import { prisma } from '@/lib/prisma';
import { Users, FileBox, HardDrive, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { getDirectorySize, formatBytes } from '@/lib/storage';
import path from 'path';
import { GrowthChart, FileTypeChart } from '@/components/admin/Charts';

export default async function AdminDashboard() {
  const userCount = await prisma.user.count();
  const caseCount = await prisma.case.count();
  
  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true, role: true }
  });

  // Calculate storage usage
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const totalSize = getDirectorySize(uploadsDir);
  const formattedSize = formatBytes(totalSize);

  // Growth data (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const growthData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const userCountForDay = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    const caseCountForDay = await prisma.case.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    growthData.push({
      name: ` ${date.getMonth() + 1}/${date.getDate()}`,
      users: userCountForDay,
      cases: caseCountForDay
    });
  }

  // File type statistics
  const allFiles = await prisma.file.findMany({
    select: { type: true }
  });

  const fileTypeCounts = allFiles.reduce((acc, file) => {
    const ext = file.type.toLowerCase();
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fileTypeData = Object.entries(fileTypeCounts).map(([name, value], index) => ({
    name: name.toUpperCase(),
    value,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
  }));

  // Average case size
  const avgFileCount = caseCount > 0 ? (allFiles.length / caseCount).toFixed(1) : '0';

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>대시보드</h1>
      
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <StatCard title='총 사용자' value={userCount.toString()} icon={Users} color='bg-blue-500' />
        <StatCard title='총 케이스' value={caseCount.toString()} icon={FileBox} color='bg-green-500' />
        <StatCard title='스토리지 사용량' value={formattedSize} icon={HardDrive} color='bg-purple-500' />
        <StatCard title='평균 파일 수/케이스' value={avgFileCount} icon={BarChart3} color='bg-orange-500' />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Growth Chart */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='font-semibold text-gray-700 flex items-center gap-2 mb-4 dark:text-gray-200'>
            <TrendingUp size={18} />
            최근 7일 성장 추이
          </h3>
          <GrowthChart data={growthData} />
        </div>

        {/* File Type Chart */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='font-semibold text-gray-700 flex items-center gap-2 mb-4 dark:text-gray-200'>
            <PieChartIcon size={18} />
            파일 타입별 분포
          </h3>
          {fileTypeData.length > 0 ? (
            <FileTypeChart data={fileTypeData} />
          ) : (
            <div className='h-[300px] flex items-center justify-center text-gray-400'>
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Recent Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='font-semibold text-gray-700 flex items-center gap-2 dark:text-gray-200'>
            <TrendingUp size={18} />
            최근 가입한 사용자
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300'>
              <tr>
                <th className='px-6 py-3'>이름</th>
                <th className='px-6 py-3'>이메일</th>
                <th className='px-6 py-3'>권한</th>
                <th className='px-6 py-3'>가입일</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className='bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'>
                  <td className='px-6 py-4 font-medium text-gray-900 dark:text-gray-100'>
                    {user.name || 'N/A'}
                  </td>
                  <td className='px-6 py-4'>{user.email}</td>
                  <td className='px-6 py-4'>
                    <span className={` px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                 <tr>
                    <td colSpan={4} className='px-6 py-4 text-center dark:text-gray-400'>사용자가 없습니다.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700'>
      <div>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{title}</p>
        <p className='text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100'>{value}</p>
      </div>
      <div className={` p-3 rounded-full text-white ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

