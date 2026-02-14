'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function TopBar() {
    const demoMode = useAppStore(s => s.demoMode);
    const actions = useAppStore(s => s.actions);

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Link href="/" className="font-bold text-xl text-primary flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-display tracking-wider">Cyano智能阅卷</span>
                </Link>
                <div className="text-xs bg-warm text-ink px-2 py-0.5 rounded-full font-medium ml-2">
                    Demo v0.1
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={demoMode}
                            onChange={e => actions.setDemoMode(e.target.checked)}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span>演示模式</span>
                    </label>
                </div>

                <button
                    onClick={() => {
                        if (confirm('确定重置所有状态？')) {
                            actions.resetAll();
                            window.location.href = '/task';
                        }
                    }}
                    className="text-gray-500 hover:text-red-600 p-2 rounded hover:bg-gray-100"
                    title="重置 Demo"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
