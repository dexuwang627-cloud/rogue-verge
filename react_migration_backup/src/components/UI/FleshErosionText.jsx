import { useState, useEffect } from 'react';

const FleshErosionText = ({ text, className }) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovered, setIsHovered] = useState(false);

    const originalText = text;
    const chaosChars = 'X@#$?!&%*^/\\|<>~';

    useEffect(() => {
        let interval;

        if (isHovered) {
            interval = setInterval(() => {
                const newText = originalText.split('').map((char) => {
                    if (Math.random() > 0.7) {
                        return chaosChars[Math.floor(Math.random() * chaosChars.length)];
                    }
                    return char;
                }).join('');

                setDisplayText(newText);
            }, 50);
        }

        return () => clearInterval(interval);
    }, [isHovered, originalText]);

    return (
        <span
            className={`relative inline-block group cursor-none ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setDisplayText(originalText);
            }}
        >
            {/* Base Glitch Effect (CSS) */}
            <span
                className={`relative z-10 transition-colors duration-100 ${isHovered ? 'text-red-600 animate-flesh-erosion font-serif' : 'text-red-500'}`}
                data-text={originalText}
            >
                {displayText}
            </span>

            {/* Hard Glitch Overlays (Visible on Hover) */}
            <span
                className={`absolute top-0 left-0 -ml-0.5 text-cyan-500 opacity-0 animate-noise font-serif pointer-events-none ${isHovered ? 'opacity-80' : ''}`}
                style={{ animationDirection: 'reverse' }}
                aria-hidden="true"
            >
                {displayText}
            </span>
            <span
                className={`absolute top-0 left-0 ml-0.5 text-red-900 opacity-0 animate-noise font-serif pointer-events-none ${isHovered ? 'opacity-80' : ''}`}
                aria-hidden="true"
            >
                {displayText}
            </span>

            {/* Binary Rain / Code Drip */}
            {isHovered && (
                <span className="absolute -bottom-4 left-1/2 w-full text-[8px] font-serif text-red-600 -translate-x-1/2 text-center opacity-70 pointer-events-none whitespace-nowrap">
                    010101 ERROR
                </span>
            )}
        </span>
    );
};

export default FleshErosionText;
