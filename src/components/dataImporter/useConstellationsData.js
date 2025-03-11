import { useState, useEffect } from "react";
import { json } from "d3";

export const useConstellationsData = () => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        json(`${process.env.PUBLIC_URL}/assets/data/constellations.json`).then(setData);
      }, []);
      
      return data;
};