import { prisma } from '@/lib/prisma';
import { updateUserRole, deleteUser, toggleUserStatus } from '../actions';
import { MoreHorizontal, Shield, Trash2, UserCog, Ban, CheckCircle } from 'lucide-react';
import UserSearch from '@/components/admin/UserSearch';
import UserPlanSelect from '@/components/admin/UserPlanSelect';
import UserTableActions from '@/components/admin/UserTableActions';

export default async function UsersPage({ searchParams }: { searchParams: { query?: string; role?: string } }) {
    const query = searchParams?.query || '';
    const role = searchParams?.role || '';

    const whereCondition: any = {};
    if (query) {
        whereCondition.OR = [
            { name: { contains: query } },
            { email: { contains: query } }
        ];
    }
    if (role && role != 'ALL') {
        whereCondition.role = role;
    }

    const users = await prisma.user.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { Case: true }
            }
        }
    });

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>사용자 관리</h1>
                <span className='text-sm text-gray-500 dark:text-gray-400'>총 {users.length}명</span>
            </div>

            <UserSearch />

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300'>
                            <tr>
                                <th className='px-6 py-3'>사용자</th>
                                <th className='px-6 py-3'>이메일</th>
                                <th className='px-6 py-3'>권한</th>
                                <th className='px-6 py-3'>상태</th>
                                <th className='px-6 py-3'>요금제</th>
                                <th className='px-6 py-3'>케이스 수</th>
                                <th className='px-6 py-3'>가입일</th>
                                <th className='px-6 py-3'>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className='bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'>
                                    <td className='px-6 py-4 font-medium text-gray-900 flex items-center gap-3 dark:text-gray-100'>
                                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300'>
                                            {user.name ? user.name.substring(0, 1) : 'U'}
                                        </div>
                                        {user.name || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4'>{user.email}</td>
                                    <td className='px-6 py-4'>
                                        <span className={` px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className='px-6 py-4'>
                                        <span className={` px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                                            {user.isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
                                            {user.isActive ? '활성' : '차단됨'}
                                        </span>
                                    </td>
                                    <td className='px-6 py-4'>
                                        <div className="w-32">
                                            <UserPlanSelect userId={user.id} currentPlan={(user.plan as string) || 'FREE'} />
                                        </div>
                                    </td>
                                    <td className='px-6 py-4'>{user._count.Case}</td>
                                    <td className='px-6 py-4'>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className='px-6 py-4'>
                                        <UserTableActions user={{id: user.id, isActive: user.isActive}} />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={8} className='px-6 py-4 text-center dark:text-gray-400'>검색 결과가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
