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
    const [starDetails, setStarDetails] = useState(null);
    const constellations = useConstellationsData();

    if (!data || !constellations) {
        return <pre>Loading...</pre>;
    }

    return (
        <div>
            <div id="container" className="container-horizontal">
                {!starDetails && <Map data={data} constellations={constellations} getStarDetails={star => setStarDetails(star)}/>                }
                {starDetails && <div onClick={() => setStarDetails(null)} ><ParallaxSimulation distance_pc={starDetails.dist} px={starDetails.parallax} /> </div>}
            </div>
        </div>
    );
};

export default App;
