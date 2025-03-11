import React, { useState, useEffect } from 'react';
import { csv } from 'd3';

export const useStarsData = () => {
  const [data, setData] = useState(null);

  const normalizedRA = (ra) => {
    return ((ra + 180) % 360) - 180;
  };

  const bvToTemp = (bv) => {
    const T_K = 4600 * ((1 / (0.92 * bv + 1.7)) + (1 / (0.92 * bv + 0.62)));
    const T_C = T_K - 273.15;
    return T_C;
  }

  const bvToColor = (bv) => {
    if (bv < -0.3) {
      return '#9BB2FF';
    }
    else if (bv < 0.4) {
      return '#AABFFF';
    }
    else if (bv == 0) {
      return '#F8F7FF';
    }
    else if (bv < 0.5) {
      return '#FFF4EA';
    }
    else if (bv < 1) {
      return '#FFECC9';
    }
    else if (bv < 1.5) {
      return '#FFD2A1';
    }
    else {
      return '#FFCC6F';
    }
  }

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
      d.temp = bvToTemp(d.bv);
      d.color = bvToColor(d.bv);
      return d;
    }
    csv(`/assets/data/result.csv`, row).then((data) => {
      const northernHemisphereStars = data.filter(d => d.dec >= 0);
      const starsWithNames = northernHemisphereStars.filter(star => star.name !== null && star.name !== '');
      setData(northernHemisphereStars);
    });
  }, []);
  
  return data;
};