import { useState, useEffect } from 'react';

export const Pointer = ({ height, width }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e) => {
        const rect = e.target.closest('svg');
        if (rect) {
            let rectBounds = rect.getBoundingClientRect();
            console.log(rectBounds);
            const x = e.clientX - rectBounds.left;  // x relative to the component
            const y = e.clientY - rectBounds.top;   // y relative to the component
            setPosition({ x, y });
        }
    };

    useEffect(() => {
        const container = document.getElementById('container');
        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Empty dependency array ensures the listener is only attached once

    return (
            <g className="pointer">
                <line 
                    x1={position.x}   // x-coordinate of the start point
                    y1={0}    // y-coordinate of the start point (this can be your specific height)
                    x2={position.x}   // x-coordinate of the end point (same x as start to make it vertical)
                    y2={height}   // y-coordinate of the end point (this can be the bottom of your canvas or any height)
                    stroke="orange" // Color of the line
                    strokeWidth="2" // Width of the line
                    strokeDasharray="5,5"
                />
                <line 
                    x1={0}   // x-coordinate of the start point
                    y1={position.y}    // y-coordinate of the start point (this can be your specific height)
                    x2={width}   // x-coordinate of the end point (same x as start to make it vertical)
                    y2={position.y}   // y-coordinate of the end point (this can be the bottom of your canvas or any height)
                    stroke="orange" // Color of the line
                    strokeWidth="2" // Width of the line
                    strokeDasharray="5,5"
                />
                <circle
                    cx={position.x}
                    cy={position.y}
                    r={4}
                    fill={"transparent"}
                    stroke={"orange"}
                />
            </g>
    )
};