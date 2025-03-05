import { useEffect, useState, useRef } from "react";
import { Star } from "../star/Star";
import { geoAzimuthalEquidistant, geoPath, geoGraticule, geoCircle, scaleLog, zoom, select, min, pointer} from "d3";
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
    
    const minOpacity = 1;
    const maxOpacity = 0.3;
    const minSize = 5;
    const maxSize = 15;

    const minValue = Math.min(...data.map(d => d.mag));
    const maxValue = Math.max(...data.map(d => d.mag));


    const scaleOpacity  = scaleLog()
    .domain([minValue, maxValue])
    .range([minOpacity, maxOpacity]);

    const scaleSize = scaleLog()
        .domain([minValue, maxValue])
        .range([minSize, maxSize]);

    const outline = geoCircle().radius(90).center([0, 90])();
    const graticule = geoGraticule().stepMinor([30, 20])();
    const projection = geoAzimuthalEquidistant()
                        .clipAngle(90)
                        .rotate(rotation)
                        .scale(initialScale)
                        .translate([width / 2, height / 2])
                        .precision(0.1);

    const gPath = geoPath().projection(projection);

    useEffect(() => {
        const g = select(gRef.current);
        const svg = select(svgRef.current);
        
        const zoomed = (event) => {
            const [cursorX, cursorY] = pointer(event, svg.node());
            // g.attr("transform", transform);
            const scale = event.transform.k;
            const updatedProjection = projection.scale(initialScale * scale); 
                    
            g.selectAll(".star").nodes().forEach((node) => {
                const star = data.filter(d => d.hip_id === node.id)[0];
                const ra = star.ra;
                const dec = star.dec;
                const starSize = scaleSize(star.mag);
                const starSvgSize = { width: 471, height: 477 };
    
                const scaleX = starSize / starSvgSize.width;
                const scaleY = starSize / starSvgSize.height;

                const [x, y] = updatedProjection([ra, dec]);

                const translateX = (x - cursorX) * scale + cursorX;
                const translateY = (y - cursorY) * scale + cursorY;
                console.log(translateX, translateY);
                node.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scaleX}, ${scaleY}) rotate(${Math.random() * 30})`);
            });
            
            const updatedPath = geoPath().projection(updatedProjection); // Create a new path generator with the updated projection

            g.select("#graticules").attr("d", updatedPath(graticule));
        };

        const myZoom = zoom()
            .scaleExtent([1,3])
            .on("zoom", zoomed);

        svg.call(myZoom);

    }, []);

    const getStarData = (hip_id) => {
        let star = data.find(d => d.hip_id === hip_id);
        getStarDetails(star);
    };

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
                    <image href="/assets/images/starmap.jpg" x="0" y="0" width={dimention} height={dimention} preserveAspectRatio="xMidYMid slice"></image>
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
                                color={d.bv ? d.bv :  'white'}
                                hip_id={d.hip_id}
                                getStarDetails={getStarData}
                            />
                        ))
                    }
                </g>
            </g>
        </svg>
    );
}
