/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { dimension: 'w-9 h-9', textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { dimension: 'w-12 h-12', textTitle: 'text-base font-bold', textSub: 'text-[11px]' },
    lg: { dimension: 'w-20 h-20', textTitle: 'text-xl font-bold', textSub: 'text-xs' },
    xl: { dimension: 'w-28 h-28', textTitle: 'text-2xl font-black', textSub: 'text-sm' },
  };

  const { dimension, textTitle, textSub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official School Logo Emblem */}
      <img
        src="/assets/aistudio/Logo_Sekolah_Gold_9cabe95d.png"
        alt="Logo Yayasan Pendidikan Katolik Keuskupan Amboina - SD Xaverius A1 Ambon"
        className={`${dimension} object-contain shrink-0 drop-shadow-md rounded-full`}
        loading="eager"
      />

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${textTitle} tracking-wider text-[#071D49] font-black uppercase`}>
              XAVERIUS <span className="text-[#D4AF37]">EXAM</span>
            </span>
          </div>
          <span className={`${textSub} font-bold text-slate-600 tracking-wide uppercase`}>
            SD XAVERIUS A1 AMBON
          </span>
        </div>
      )}
    </div>
  );
};
