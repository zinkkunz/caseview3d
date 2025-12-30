import { prisma } from '@/lib/prisma';
import { deleteCase } from '../actions';
import { Trash2, FileBox, AlertCircle } from 'lucide-react';
import CaseSearch from '@/components/admin/CaseSearch';
import DeleteExpiredButton from '@/components/admin/DeleteExpiredButton';
import CaseTableActions from '@/components/admin/CaseTableActions';

export default async function CasesPage({ searchParams }: { searchParams: { query?: string; owner?: string } }) {
  const query = searchParams?.query || '';
  const owner = searchParams?.owner || '';

  const whereCondition: any = {};
  if (query) whereCondition.title = { contains: query };
  if (owner) whereCondition.User = { email: { contains: owner } };

  const cases = await prisma.case.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
        User: { select: { name: true, email: true } },
        File: true
    }
  });

  const expiredCount = await prisma.case.count({
    where: { expiryDate: { lt: new Date() } }
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>케이스 관리</h1>
        <div className='flex items-center gap-4'>
          {expiredCount > 0 && <DeleteExpiredButton expiredCount={expiredCount} />}
          <span className='text-sm text-gray-500 dark:text-gray-400'>총 {cases.length}개</span>
        </div>
      </div>

      <CaseSearch />

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300'>
              <tr>
                <th className='px-6 py-3'>케이스명</th>
                <th className='px-6 py-3'>소유자</th>
                <th className='px-6 py-3'>파일 수</th>
                <th className='px-6 py-3'>총 용량</th>
                <th className='px-6 py-3'>생성일</th>
                <th className='px-6 py-3'>만료일</th>
                <th className='px-6 py-3'>관리</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                const totalSize = c.File.reduce((acc, f) => acc + (f.size || 0), 0);
                return (
                <tr key={c.id} className={` bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 ${isExpired ? 'opacity-60' : ''}`}>
                  <td className='px-6 py-4 font-medium text-gray-900 flex items-center gap-3 dark:text-gray-100'>
                    <div className={` w-8 h-8 rounded flex items-center justify-center ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <FileBox size={16} />
                    </div>
                    <div>
                        <div className='font-medium'>{c.title || '제목 없음'}</div>
                        <div className='text-xs text-gray-400'>{c.id}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div>{c.User?.name || 'N/A'}</div>
                    <div className='text-xs text-gray-400'>{c.User?.email}</div>
                  </td>
                  <td className='px-6 py-4'>
                    {c.File.length}개
                  </td>
                  <td className='px-6 py-4 font-medium'>
                    {(totalSize / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className='px-6 py-4'>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4'>
                    {c.expiryDate ? (
                      <span className={` text-xs px-2 py-1 rounded ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className='text-xs text-gray-400'>영구</span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <CaseTableActions caseId={c.id} />
                  </td>
                </tr>
              )})}
               {cases.length === 0 && (
                 <tr>
                    <td colSpan={7} className='px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2 dark:text-gray-400'>
                        <AlertCircle size={24} className='text-gray-300' />
                        <span className='block'>검색 결과가 없습니다.</span>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
