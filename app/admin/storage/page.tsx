export const dynamic = 'force-dynamic';
﻿import { prisma } from "@/lib/prisma";
import { getUserStorageStats, getLargeFiles, formatBytes } from "@/lib/storage";
import { Users, FileText } from "lucide-react";
import path from "path";

export default async function StoragePage() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // Get user storage stats
  const users = await prisma.user.findMany({
    include: {
      Case: {
        include: {
          File: true
        }
      }
    }
  });

  const userStats = getUserStorageStats(uploadsDir, users);
  const topUsers = userStats.slice(0, 20);

  // Get large files
  const largeFiles = getLargeFiles(uploadsDir, 10);
  const topLargeFiles = largeFiles.slice(0, 20);

  const totalStorage = userStats.reduce((sum, user) => sum + user.totalSize, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">저장 공간 모니터링</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          전체 사용량: <span className="font-bold text-gray-900 dark:text-gray-100">{formatBytes(totalStorage)}</span>
        </div>
      </div>

      {/* User Storage Ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 dark:text-gray-200">
            <Users size={18} />
            사용자별 용량 순위 (상위 20명)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">순위</th>
                <th className="px-6 py-3">사용자</th>
                <th className="px-6 py-3">이메일</th>
                <th className="px-6 py-3">케이스 수</th>
                <th className="px-6 py-3">사용 용량</th>
                <th className="px-6 py-3">鍮꾩쑉</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => {
                const percentage = totalStorage > 0 ? ((user.totalSize / totalStorage) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={user.userId} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">{user.userName || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">{user.userEmail}</td>
                    <td className="px-6 py-4">{user.caseCount}</td>
                    <td className="px-6 py-4 font-semibold">{formatBytes(user.totalSize)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {topUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center dark:text-gray-400">데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Large Files */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 dark:text-gray-200">
            <FileText size={18} />
            대용량 파일 (10MB 이상, 상위 20개)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">순위</th>
                <th className="px-6 py-3">파일명</th>
                <th className="px-6 py-3">크기</th>
                <th className="px-6 py-3">寃쎈줈</th>
              </tr>
            </thead>
            <tbody>
              {topLargeFiles.map((file, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium">{file.fileName}</td>
                  <td className="px-6 py-4 font-semibold text-orange-600 dark:text-orange-400">{formatBytes(file.size)}</td>
                  <td className="px-6 py-4 text-xs text-gray-400 truncate max-w-md">{file.filePath}</td>
                </tr>
              ))}
              {topLargeFiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center dark:text-gray-400">10MB 이상의 파일이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

