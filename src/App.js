import { useStarsData } from './components/dataImporter/useStarsData';
import { useConstellationsData } from './components/dataImporter/useConstellationsData';
import { Map } from './components/map/Map';
import { Pointer } from './components/pointer/Pointer';
import { ParallaxSimulation } from './components/parallaxSimulation/ParallaxSimulation';
import { StarDetailsModal } from './components/starDetailsModal/StarDetailsModal';
import { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';

import './App.css';

const App = () => {
    const data = useStarsData();
    const [starDetails, setStarDetails] = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const constellations = useConstellationsData();

    if (!data || !constellations) {
        return <pre>Loading...</pre>;
    }


    const onStarClick = (star) => {
        setStarDetails(star);
        setIsOpen(true);
    }

    return (
        <div>
            <div id="container" className="container-horizontal">
                {!modalIsOpen && <Map data={data} constellations={constellations} getStarDetails={star => onStarClick(star)}/>                }
                {modalIsOpen && <StarDetailsModal 
                    star={starDetails} 
                    modalIsOpen={modalIsOpen}
                    setIsOpen={setIsOpen} />}
            </div>
        </div>
    );
};

export default App;
