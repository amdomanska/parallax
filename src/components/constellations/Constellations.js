import React from 'react';

export const Constellations = ({constellationsData, geoPath}) => (
    constellationsData.map((feature, i) => (
                <path 
                    key={i}
                    d={geoPath(feature)} 
                    stroke="white"
                    strokeWidth={0.5} 
                    fill="none"
                    opacity={0.7}
                />
        )
    )
);