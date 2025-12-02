import { useState, useEffect } from 'react';

const ScrambleText = ({ text, className }) => {
    const [displayText, setDisplayText] = useState(text);
    useEffect(() => {
        setDisplayText(text);
    }, [text]);

    const chars = '!<>-_\\/[]{}—=+*^?#________';

    const scramble = () => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(() =>
                text.split('').map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('')
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    };

    return (
        <p onMouseEnter={scramble} className={className}>
            {displayText}
        </p>
    );
};

export default ScrambleText;
