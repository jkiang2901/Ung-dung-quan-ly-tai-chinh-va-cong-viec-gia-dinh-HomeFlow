import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  autoHideDuration?: number; // ms before auto hiding, e.g. 2500
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoHideDuration = 2500,
}) => {
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (autoHideDuration <= 0) return;

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, autoHideDuration - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, autoHideDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [autoHideDuration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#02331b] via-[#044a28] to-[#012513] text-white transition-opacity duration-500 select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Logo & Content Container */}
      <div className="flex flex-col items-center justify-center relative z-10 space-y-6 animate-in zoom-in-95 duration-700">
        {/* Squircle App Icon */}
        <div className="relative w-28 h-28 rounded-[32px] bg-gradient-to-br from-[#10b981] via-[#056839] to-[#034d2a] p-0.5 shadow-[0_15px_40px_rgba(5,104,57,0.5)] flex items-center justify-center border border-emerald-400/30 group">
          <div className="w-full h-full rounded-[30px] bg-[#056839]/90 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
            {/* House silhouette with Orange coin */}
            <div className="relative flex flex-col items-center">
              {/* Roof & House Shape */}
              <div className="w-14 h-14 bg-white clip-house flex items-center justify-center shadow-md relative rounded-b-md">
                {/* Roof Triangle */}
                <div className="absolute -top-3 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[24px] border-b-white" />
                
                {/* Orange Coin inside House */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 border-2 border-white flex items-center justify-center shadow-md z-10 mt-1">
                  <span className="text-white text-xs font-black tracking-tighter">₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name: HomeFlow. */}
        <div className="text-center pt-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-baseline justify-center">
            HomeFlow<span className="text-orange-500 text-5xl leading-none ml-0.5 animate-bounce">.</span>
          </h1>

          {/* Slogan Subtitle */}
          <p className="text-[14px] font-semibold text-emerald-200/80 tracking-wide mt-2">
            Tổ ấm thảnh thơi <span className="mx-1 text-emerald-400">•</span> Tài chính vẹn tròn
          </p>
        </div>
      </div>

      {/* Loading Spinner / Progress indicator */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    </div>
  );
};
