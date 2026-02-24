import React from 'react';

export const DataStreamBorder = () => {
    // 使用重複的 Base64 亂碼字符作為內容，創造數據流錯覺
    const dataString = "RVQ/NDU1NDUwNiBHSEs0OUQhIzUgQ09SQUlOMDAwMSBaMTAxMjQw";

    // 渲染單條邊緣的數據流
    const BorderSegment = ({ isHorizontal, position }) => {
        const baseClasses = `absolute overflow-hidden font-serif text-[8px] text-gray-700 whitespace-nowrap`;
        let style = {};
        let content = dataString + dataString + dataString; // 重複內容用於滾動

        if (isHorizontal) {
            // 上邊和下邊的滾動
            style = {
                width: '100%',
                height: '10px',
                left: '0',
            };
            if (position === 'top') style.top = '0';
            if (position === 'bottom') style.bottom = '0';

            return (
                <div className={`${baseClasses} ${position === 'top' ? 'top-0' : 'bottom-0'} `} style={style}>
                    <div className="absolute w-[200%] animate-data-scroll">{content}</div>
                </div>
            );
        } else {
            // 左邊和右邊的垂直數據流 (旋轉 90 度)
            style = {
                width: '10px',
                height: '100%',
                top: '0',
            };
            if (position === 'left') style.left = '0';
            if (position === 'right') style.right = '0';

            return (
                <div className={`${baseClasses} ${position === 'left' ? 'left-0' : 'right-0'} transform rotate-90 origin-top-left`} style={style}>
                    <div className="absolute w-[200%] animate-data-scroll">{content}</div>
                </div>
            );
        }
    };

    return (
        <React.Fragment>
            <BorderSegment isHorizontal={true} position="top" />
            <BorderSegment isHorizontal={true} position="bottom" />
            {/* 垂直邊緣需要額外調整定位來配合旋轉 */}
            <div className="absolute top-0 left-full -translate-x-full" style={{ width: '10px', height: '100%' }}>
                <BorderSegment isHorizontal={false} position="right" />
            </div>
            <div className="absolute top-0 right-full translate-x-full" style={{ width: '10px', height: '100%' }}>
                <BorderSegment isHorizontal={false} position="left" />
            </div>
        </React.Fragment>
    );
};
