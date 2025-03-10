import React from 'react';
import {scaleLinear, interpolateBlues, interpolateReds} from 'd3';
import styles from './Star.module.scss';

export const Star = ({ pos, mag, color, hip_id, ra, dec, getStarDetails}) => {
    const [ x, y ] = pos;
    const starSize = mag.size;
    const starSvgSize = { width: 471, height: 477 };

    const scaleX = starSize / starSvgSize.width;
    const scaleY = starSize / starSvgSize.height;

    const generateRandomDelay = () => {
        return Math.random(); // Generates a delay between 0 and 0.5 seconds
    };

    const gradientId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;


    return (        
        <g 
            id={hip_id}
            className="star"
            onPointerDown={() => getStarDetails(hip_id)} 
            transform={`
                translate(${x},${y}) 
                rotate(${Math.random() * 30})
                scale(${scaleX}, ${scaleY})
            `}
        >
            <defs>
                <radialGradient id={gradientId}>
                    <stop offset= "0" stopColor={color}/>
                    <stop offset="30%" stopColor="#F0F0F0"/>
                </radialGradient>
            </defs>
            <path d="M0 238C202 226.5 225.5 231.5 235 0.5C244.5 231.5 268.5 227 470.5 238.5C268.5 250 245 245.5 235.5 476.5C226 245.5 202 249.5 0 238Z" 
                fill={`url(#${gradientId})`}  className={styles.starIcon} style={{ animationDelay: `${generateRandomDelay()}s` }}/>
        </g>
    );

};