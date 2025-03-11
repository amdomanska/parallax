import { useState, useEffect } from "react";
import { json } from "d3";

export const useConstellationsData = () => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        json('/assets/data/constellations.json').then(setData);
      }, []);
      
      return data;
};