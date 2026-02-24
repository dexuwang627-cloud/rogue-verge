import React, { useEffect, useRef } from 'react';

export const ScrambleText = ({ text, className }) => {
    const textRef = useRef(null);
    const intervalRef = useRef(null);
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        if (textRef.current) {
            textRef.current.textContent = text;
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [text]);

    const scramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        let iteration = 0;
        intervalRef.current = setInterval(() => {
            if (!textRef.current) {
                clearInterval(intervalRef.current);
                return;
            }
            textRef.current.textContent = text.split('').map((letter, index) => {
                if (index < iteration) {
                    return text[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');

            if (iteration >= text.length) {
                clearInterval(intervalRef.current);
                textRef.current.textContent = text;
            }

            iteration += 1 / 3;
        }, 30);
    };

    return (
        <span ref={textRef} onMouseEnter={scramble} className={className}>
            {text}
        </span>
    );
};
