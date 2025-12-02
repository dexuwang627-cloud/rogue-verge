import React from 'react';

const dataString = "RVQ/NDU1NDUwNiBHSEs0OUQhIzUgQ09SQUlOMDAwMSBaMTAxMjQw";

const BorderSegment = ({ isHorizontal, position }) => {
    const baseClasses = `absolute overflow-hidden font-serif text-[8px] text-gray-700 whitespace-nowrap`;
    let style = {};
    let content = dataString + dataString + dataString;

    if (isHorizontal) {
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

const DataStreamBorder = () => {
    return (
        <React.Fragment>
            <BorderSegment isHorizontal={true} position="top" />
            <BorderSegment isHorizontal={true} position="bottom" />
            <div className="absolute top-0 left-full -translate-x-full" style={{ width: '10px', height: '100%' }}>
                <BorderSegment isHorizontal={false} position="right" />
            </div>
            <div className="absolute top-0 right-full translate-x-full" style={{ width: '10px', height: '100%' }}>
                <BorderSegment isHorizontal={false} position="left" />
            </div>
        </React.Fragment>
    );
};

export default DataStreamBorder;
