'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">CaseView3D</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                            치과 보철 디자인의 공유와 확인을 위한 가장 빠르고 안전한 방법입니다. 지금 바로 효율적인 워크플로우를 시작하세요.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Globe size={20} /></a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link href="#features" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">주요 기능</Link></li>
                            <li><Link href="#pricing" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">요금제</Link></li>
                            <li><Link href="/viewer/demo" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">데모 보기</Link></li>
                            <li><Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">회원가입/로그인</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/docs" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">가이드북</Link></li>
                            <li><Link href="/faq" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">자주 묻는 질문</Link></li>
                            <li><Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">이용약관</Link></li>
                            <li><Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm transition-colors">개인정보처리방침</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                <MapPin size={18} className="shrink-0 text-blue-600 mt-0.5" />
                                <span>대한민국 서울특별시</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                                <Mail size={18} className="shrink-0 text-blue-600" />
                                <span>support@caseview3d.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                                <Phone size={18} className="shrink-0 text-blue-600" />
                                <span>02-1234-5678</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-xs">
                        © {new Date().getFullYear()} CaseView3D. All rights reserved. Professional Dental 3D Solutions.
                    </p>
                    <p className="text-gray-400 text-[10px] md:text-xs text-center md:text-right leading-loose">
                        사업자등록번호: [번호 입력] | 대표자: [이름 입력] | 통신판매업신고: [번호 입력]
                    </p>
                </div>
            </div>
        </footer>
    );
}
