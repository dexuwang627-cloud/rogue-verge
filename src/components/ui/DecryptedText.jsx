import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

/**
 * DecryptedText component from React Bits
 * Replicates the "decryption" effect by rapidly cycling through random characters
 * before settling on the correct target text.
 */
export const DecryptedText = forwardRef(({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = "start",
    useOriginalCharsOnly = false,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+{}:<>?|[];',./",
    className = "",
    parentClassName = "",
    encryptedClassName = "",
    animateOn = "hover",
    ...props
}, ref) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [isScrambling, setIsScrambling] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef(null);
    const intervalRef = useRef(null);

    // Provide default fallback if framer-motion is missing, but this should be wrapped
    const MotionComponent = 'span';

    useEffect(() => {
        let isObserverActive = false;
        let observer = null;

        if (animateOn === 'view' && containerRef.current) {
            observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    startScramble();
                    setHasAnimated(true);
                }
            }, { threshold: 0.1 });

            observer.observe(containerRef.current);
            isObserverActive = true;
        }

        return () => {
            if (isObserverActive && observer && containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [animateOn, hasAnimated]);

    const startScramble = () => {
        if (isScrambling) return;
        setIsScrambling(true);
        if (intervalRef.current) clearInterval(intervalRef.current);

        let iteration = 0;
        const textArray = text.split('');
        const charSet = useOriginalCharsOnly ? Array.from(new Set(textArray)).join('') : characters;

        intervalRef.current = setInterval(() => {
            setDisplayText((prev) => {
                const newText = textArray.map((char, index) => {
                    if (char === ' ') return ' ';

                    let revealCondition = false;
                    if (sequential) {
                        if (revealDirection === 'start') revealCondition = index < iteration;
                        else if (revealDirection === 'end') revealCondition = index > textArray.length - iteration;
                        else {
                            const center = Math.floor(textArray.length / 2);
                            revealCondition = Math.abs(index - center) < iteration / 2;
                        }
                    } else {
                        revealCondition = iteration >= maxIterations;
                    }

                    if (revealCondition) {
                        return char;
                    }

                    return charSet[Math.floor(Math.random() * charSet.length)];
                }).join('');

                return newText;
            });

            iteration += sequential ? 1 / 3 : 1;

            if ((sequential && iteration >= text.length) || (!sequential && iteration >= maxIterations)) {
                clearInterval(intervalRef.current);
                setDisplayText(text);
                setIsScrambling(false);
            }
        }, speed);
    };

    const handleMouseEnter = () => {
        if (animateOn === 'hover') {
            setIsHovering(true);
            startScramble();
        }
    };

    const handleMouseLeave = () => {
        if (animateOn === 'hover') {
            setIsHovering(false);
        }
    };

    useImperativeHandle(ref, () => ({
        startScramble
    }));

    return (
        <motion.span
            ref={containerRef}
            className={`inline-block ${parentClassName}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <span className={`${className} ${isScrambling ? encryptedClassName : ''}`}>
                {displayText}
            </span>
        </motion.span>
    );
});
