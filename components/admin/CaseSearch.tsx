'use client';

import { Search, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function CaseSearch() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace('/admin/cases?' + params.toString());
  }, 300);

  const handleOwnerSearch = useDebouncedCallback((email: string) => {
    const params = new URLSearchParams(searchParams);
    if (email) {
      params.set('owner', email);
    } else {
      params.delete('owner');
    }
    replace('/admin/cases?' + params.toString());
  }, 300);

  return (
    <div className='flex gap-4 mb-6'>
      <div className='relative flex-1'>
        <label htmlFor='search' className='sr-only'>케이스 검색</label>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
        <input
          id='search'
          className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
          placeholder='케이스 제목 검색...'
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className='relative flex-1'>
        <label htmlFor='owner' className='sr-only'>소유자 검색</label>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
        <input
          id='owner'
          className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
          placeholder='소유자 이메일 검색...'
          defaultValue={searchParams.get('owner')?.toString()}
          onChange={(e) => handleOwnerSearch(e.target.value)}
        />
      </div>
    </div>
  );
}