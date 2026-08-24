'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Zap, Sliders, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { UnifiedSettingsModal } from '../settings/UnifiedSettingsModal';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isMCU = pathname?.startsWith('/mcu');
  const isDCU = pathname?.startsWith('/dcu');
  const isSelect = pathname === '/' || pathname === '/select';

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d14]/95 backdrop-blur-xl border-t-[3px] border-black shadow-[0_-4px_0_0_#000000] pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5 px-3 flex items-center justify-around">
        {/* Marvel Tab */}
        <Link
          href="/mcu"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 font-display font-black text-[11px] uppercase transition -skew-x-3 active:scale-95',
            isMCU
              ? 'bg-[#E62429] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <Flame className="w-4 h-4 skew-x-3 text-amber-300" />
          <span className="skew-x-3">Marvel</span>
        </Link>

        {/* DC Tab */}
        <Link
          href="/dcu"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 font-display font-black text-[11px] uppercase transition -skew-x-3 active:scale-95',
            isDCU
              ? 'bg-[#005792] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <Zap className="w-4 h-4 skew-x-3 text-white" />
          <span className="skew-x-3">DC</span>
        </Link>

        {/* Gate Hub */}
        <Link
          href="/select"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 font-display font-black text-[11px] uppercase transition -skew-x-3 active:scale-95',
            isSelect
              ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <Layers className="w-4 h-4 skew-x-3 text-amber-400" />
          <span className="skew-x-3">Gate</span>
        </Link>

        {/* Settings Tab */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 font-display font-black text-[11px] uppercase text-zinc-400 hover:text-amber-400 transition -skew-x-3 active:scale-95 cursor-pointer"
        >
          <Sliders className="w-4 h-4 skew-x-3 text-amber-400" />
          <span className="skew-x-3">Settings</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab="features"
      />
    </>
  );
};
