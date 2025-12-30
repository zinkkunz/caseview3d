'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function UserSearch() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace('/admin/users?' + params.toString());
  }, 300);

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role && role !== 'ALL') {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    replace('/admin/users?' + params.toString());
  };

  return (
    <div className='flex gap-4 mb-6'>
      <div className='relative flex-1'>
        <label htmlFor='search' className='sr-only'>Search</label>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
        <input
          id='search'
          className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
          placeholder='이름 또는 이메일 검색...'
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <select
        className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
        onChange={(e) => handleRoleFilter(e.target.value)}
        defaultValue={searchParams.get('role')?.toString() || 'ALL'}
      >
        <option value='ALL'>전체 권한</option>
        <option value='USER'>일반 사용자</option>
        <option value='ADMIN'>관리자</option>
      </select>
    </div>
  );
}