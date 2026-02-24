import React, { useEffect, useRef } from 'react';

export const CustomCursor = ({ isAwakened }) => {
    const cursorMainRef = useRef(null);
    const cursorTrail1Ref = useRef(null);
    const cursorTrail2Ref = useRef(null);

    useEffect(() => {
        // [效能優化] 只在非觸控設備執行
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

        const mousePos = { x: 0, y: 0 };
        const trail1Pos = { x: 0, y: 0 };
        const trail2Pos = { x: 0, y: 0 };

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            mousePos.x = clientX;
            mousePos.y = clientY;

            if (cursorMainRef.current) {
                cursorMainRef.current.style.transform = `translate3d(${clientX - 16}px, ${clientY - 16}px, 0) rotate(45deg)`;
            }
        };

        const renderLoop = () => {
            trail1Pos.x += (mousePos.x - trail1Pos.x) * 0.2;
            trail1Pos.y += (mousePos.y - trail1Pos.y) * 0.2;

            trail2Pos.x += (mousePos.x - trail2Pos.x) * 0.1;
            trail2Pos.y += (mousePos.y - trail2Pos.y) * 0.1;

            if (cursorTrail1Ref.current) {
                cursorTrail1Ref.current.style.transform = `translate3d(${trail1Pos.x - 12}px, ${trail1Pos.y - 12}px, 0) rotate(45deg)`;
            }
            if (cursorTrail2Ref.current) {
                cursorTrail2Ref.current.style.transform = `translate3d(${trail2Pos.x - 8}px, ${trail2Pos.y - 8}px, 0) rotate(45deg)`;
            }

            requestAnimationFrame(renderLoop);
        };

        window.addEventListener('mousemove', handleMouseMove);
        const animationId = requestAnimationFrame(renderLoop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // 觸控設備不在 DOM 中渲染自訂游標
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return null;
    }

    return (
        <React.Fragment>
            {/* Trail 1 */}
            <div
                ref={cursorTrail1Ref}
                className="fixed w-6 h-6 border border-white/40 pointer-events-none z-[59] mix-blend-difference force-gpu"
                style={{ top: 0, left: 0 }}
            >
            </div>

            {/* Trail 2 */}
            <div
                ref={cursorTrail2Ref}
                className="fixed w-4 h-4 border border-white/20 pointer-events-none z-[58] mix-blend-difference force-gpu"
                style={{ top: 0, left: 0 }}
            >
            </div>

            {/* Primary Cursor */}
            <div
                ref={cursorMainRef}
                className="fixed w-8 h-8 border border-white pointer-events-none z-[60] mix-blend-difference ease-out flex items-center justify-center force-gpu"
                style={{ top: 0, left: 0 }}
            >
                <div className={`w-1 h-1 bg-white rounded-full ${isAwakened ? 'animate-ping bg-red-500' : ''}`}></div>
            </div>
        </React.Fragment>
    );
};
