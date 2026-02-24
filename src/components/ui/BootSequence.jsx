import React, { useState, useEffect } from 'react';

export const BootSequence = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState(['> INITIALIZING SYSTEM...']);

    const systemMessages = [
        "LOADING KERNEL...",
        "BYPASSING SECURITY PROTOCOLS...",
        "CONNECTING TO NEURAL NET...",
        "DECRYPTING ASSETS...",
        "VERIFYING RELICS...",
        "ESTABLISHING SECURE CONNECTION...",
        "SYNCING WITH ROGUE VERGE DATABASE...",
        "OPTIMIZING REALITY RENDERING...",
        "SYSTEM CHECK: OK."
    ];

    useEffect(() => {
        const hasBooted = sessionStorage.getItem('rogue_verge_booted');
        if (hasBooted === 'true') {
            onComplete();
            return;
        }

        const timer = setInterval(() => {
            setProgress((prev) => {
                const increment = Math.random() * 4;
                const newProgress = Math.min(prev + increment, 100);

                if (Math.random() > 0.7) {
                    const randomMsg = systemMessages[Math.floor(Math.random() * systemMessages.length)];
                    const hexCode = "0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
                    setLogs(prevLogs => [...prevLogs.slice(-6), `> [${hexCode}] ${randomMsg}`]);
                }

                if (newProgress >= 100) {
                    clearInterval(timer);
                    sessionStorage.setItem('rogue_verge_booted', 'true');
                    setTimeout(onComplete, 800);
                }
                return newProgress;
            });
        }, 50);

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [onComplete]);

    // 如果已經 boot 過了，就不渲染 UI (useEffect 內直接 onComplete)
    // 雖然外層也會很快 unmount，這段期間可以回傳 null 或載入狀態
    if (sessionStorage.getItem('rogue_verge_booted') === 'true') {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center font-serif text-xs md:text-sm text-red-600 overflow-hidden cursor-wait">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/50 to-transparent animate-scanline pointer-events-none"></div>

            <div className="w-80 md:w-96 relative z-10">
                <div className="mb-8 text-center text-white animate-pulse">
                    <h1 className="text-2xl font-bold tracking-widest">ROGUE VERGE</h1>
                    <p className="text-[10px] text-gray-500 mt-1 tracking-[0.5em]">SYSTEM BOOTLOADER V2.0</p>
                </div>

                <div className="w-full h-2 bg-gray-900 border border-gray-700 mb-4 relative overflow-hidden">
                    <div className="h-full bg-white transition-all duration-75 ease-out" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between mb-8 text-gray-400">
                    <span>{progress < 100 ? "LOADING..." : "COMPLETE"}</span>
                    <span>{Math.floor(progress)}%</span>
                </div>

                <div className="h-32 overflow-hidden border-l-2 border-gray-800 pl-4 text-left space-y-1 opacity-80">
                    {logs.map((log, index) => (
                        <div key={index} className="text-red-500/80 animate-pulse">{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>
            </div>
        </div>
    );
};
