import { useEffect, useState, useRef } from "react";
import { Star } from "../star/Star";
import { geoAzimuthalEquidistant, geoPath, geoGraticule, geoCircle, scaleLog, scaleSqrt, zoom, select, min, pointer, histogram} from "d3";
import { Constellations } from "../constellations/Constellations";

import styles from './Map.module.scss';

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;
const dimention = Math.min(width, height);

export const Map = ({ data, constellations, getStarDetails }) => {

    const width = 954 + 28;
    const height = width;
    const [rotation, setRotation] = useState([0, -90]); // Initial rotation: [RA, Dec]
    const initialScale = 250;
    const gRef = useRef(null); // Reference to SVG for event handling
    const svgRef = useRef(null);
    
    const minOpacity = 0.1;
    const maxOpacity = 1;
    const minSize = 5;
    const maxSize = 30;

    const minValue = Math.min(...data.map(d => d.mag));
    const maxValue = Math.max(...data.map(d => d.mag));

    const scaleOpacity  = scaleSqrt()
    .domain([minValue, maxValue])
    .range([maxOpacity, minOpacity]);

    const scaleSize = scaleSqrt()
        .domain([minValue, maxValue])
        .range([maxSize, minSize]);

    const outline = geoCircle().radius(90).center([0, 90])();
    const graticule = geoGraticule().stepMinor([30, 20])();
    const projection = geoAzimuthalEquidistant()
                        .clipAngle(90)
                        .rotate(rotation)
                        .scale(initialScale)
                        .translate([width / 2, height / 2])
                        .precision(0.1);

    const gPath = geoPath().projection(projection);

    const getStarData = (hip_id) => {
        let star = data.find(d => d.hip_id === hip_id);
        getStarDetails(star);
    };

    const starmapImgPath = `/assets/images/starmap.jpg`

    return (

        <svg 
            width={dimention} 
            height={dimention} 
            viewBox={[0, 0, dimention, dimention].join(' ')}
            className="map"
            ref={svgRef}
            >
            <defs>
                <pattern id="image-fill" x="0" y="0" width={dimention} height={dimention} patternUnits="userSpaceOnUse">
                    <image href={starmapImgPath} x="0" y="0" width={dimention} height={dimention} preserveAspectRatio="xMidYMid slice"></image>
                </pattern>
                <clipPath id="map-clip">
                    <path d={gPath(outline)} />
                </clipPath>
            </defs>
            <g className="map" ref={gRef}  clipPath="url(#map-clip)">
                <path className="outline" d={gPath(outline)} style={{fill: "url(#image-fill)"}}/>
                <path className={styles.graticules} d={gPath(graticule)} id="graticules" />
                <g className="stars">
                    {
                        data.map((d, i) => (
                            <Star 
                                key={d.hip_id} 
                                pos = {projection([d.ra, d.dec])} 
                                ra = {d.ra}
                                dec = {d.dec}
                                mag={{opacity: scaleOpacity(d.mag), size: scaleSize(d.mag)}}
                                color={d.color}
                                hip_id={d.hip_id}
                                getStarDetails={getStarData}
                            />
                        ))
                    }
                </g>
                <Constellations constellationsData={constellations} geoPath={gPath} />
            </g>
        </svg>
    );
}
