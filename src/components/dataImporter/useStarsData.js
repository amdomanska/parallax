import React, { useState, useEffect } from 'react';
import { csv } from 'd3';

export const useStarsData = () => {
  const [data, setData] = useState(null);

  const normalizedRA = (ra) => {
    return ((ra + 180) % 360) - 180;
};

  useEffect(() => {
    const row = d => {
      d.hip = +d.hip;
      d.ra = normalizedRA(+d.ra);
      d.dec = +d.dec;
      if (d.dec > 90 || d.dec < -90) {
        throw new Error('invalid dec');
      }
      if (d.ra < -180 || d.ra > 180) {
        throw new Error('invalid ra: ' + d.ra);
      }
      d.mag = +d.mag;
      d.plx = +d.parallax;
      d.dist = +d.distance_pc;
      d.bv = +d.bv;
      return d;
    }
    csv('/assets/data/result.csv', row).then((data) => {
      const northernHemisphereStars = data.filter(d => d.dec >= 0);
      setData(northernHemisphereStars);
    });
  }, []);
  
  return data;
};