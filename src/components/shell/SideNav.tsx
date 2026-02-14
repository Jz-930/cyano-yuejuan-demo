'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/lib/store/useAppStore';

export function SideNav() {
    const pathname = usePathname();
    const taskStatus = useAppStore(s => s.task.status);

    const navItems = [
        {
            href: '/task',
            label: '任务配置',
            icon: LayoutDashboard,
            active: pathname.startsWith('/task')
        },
        {
            href: '/grading',
            label: '批量阅卷',
            icon: CheckCircle,
            active: pathname.startsWith('/grading')
        },
    ];

    return (
        <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            item.active
                                ? "bg-white text-primary shadow-sm ring-1 ring-gray-200"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="mt-auto p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">当前任务状态</div>
                <div className="text-sm font-medium text-ink truncate">
                    {getStatusText(taskStatus)}
                </div>
            </div>
        </aside>
    );
}

function getStatusText(status: string) {
    const map: Record<string, string> = {
        'draft': '草稿 (Step 1-2)',
        'criteria_ready': '标准已生成 (Step 3)',
        'criteria_locked': '标准已锁定 (Step 4)',
        'calibration_uploaded': '样卷已就绪 (Step 5)',
        'calibrated': '校准完成',
        'submissions_uploaded': '全量卷已上传',
        'grading_done': '批改完成',
    };
    return map[status] || status;
}
