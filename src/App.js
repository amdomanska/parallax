import { useStarsData } from './components/dataImporter/useStarsData';
import { useConstellationsData } from './components/dataImporter/useConstellationsData';
import { Map } from './components/map/Map';
import { Pointer } from './components/pointer/Pointer';
import { StarInfo } from './components/starInfo/StarInfo';
import { ParallaxSimulation } from './components/parallaxSimulation/ParallaxSimulation';
import { useState, useEffect, useRef } from 'react';

import './App.css';

const App = () => {
    const data = useStarsData();
    const [starDetailed, setStarDetailed] = useState(null);
    const constellations = useConstellationsData();

    if (!data || !constellations) {
        return <pre>Loading...</pre>;
    }

    return (
        <div>
            <div id="container" className="container-horizontal">
                {/* <Map data={data} constellations={constellations} getStarDetails={star => setStarDetailed(star)}/>                
                <div className="stars-info" style={{backgroundColor: "black", color: "white", padding: "10px", height: height, width: "6rem", display: "none"}}>
                    <StarInfo star={starDetailed}/>
                </div> */}
                <ParallaxSimulation />
            </div>
        </div>
    );
};

export default App;
