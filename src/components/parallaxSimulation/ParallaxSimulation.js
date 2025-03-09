import React, { useEffect, useRef, useState } from 'react';
import { roundToTwoDigits } from '../../lib';

export const ParallaxSimulation = ({distance_pc, px}) => {
  const mainCanvasRef = useRef(null);
  const viewCanvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const isMounted = useRef(false);
  const inclination = 7;
  console.log("Distance: ", distance_pc);
  console.log("Parallax: ", px);

  useEffect(() => {
    isMounted.current = true;
    const mainCanvas = mainCanvasRef.current;
    const viewCanvas = viewCanvasRef.current;
    const ctx1 = mainCanvas.getContext('2d');
    const ctx2 = viewCanvas.getContext('2d');

    // Load the image of the Sun
    const sunImg = new Image();
    sunImg.src = '/assets/images/sun.png';

    let backgroundImg = new Image();
    backgroundImg.src = '/assets/images/star_field.png';

    // Constants and variables
    let xE = 0;
    let yE = 0;
    let d_pix;
    let xO = 0, yO;
    let theta_deg = 0;
    const dTheta_deg = 1;
    let R;
    const yOMin = 70;
    const yOMax = 230;
    const xSun = 150;
    const ySun = 340;
    const annOff = 60;
    const inc_deg = 7;

    const distToPix = (d_pc) => {
      // Distance in parsecs
      const A = 500; // Adjust based on visualization size
      const B = 850; // Adjust based on visualization offset
  
      // Define minimum and maximum distances in parsecs
      const dMin_pc = 3.4;
      const dMax_pc = 8401;
  
      // Apply logarithmic transformation to distances
      const log_d_pc = A * Math.log10(d_pc) + B;
      const log_dMin_pc = A * Math.log10(dMin_pc) + B;
      const log_dMax_pc = A * Math.log10(dMax_pc) + B;
  
      // Map logarithmic distance to pixel range
      const tmp = (log_d_pc - log_dMin_pc) * (yOMax - yOMin) / (log_dMax_pc - log_dMin_pc);
      yO = yOMax - tmp;
  
      // Calculate pixel distance
      return ySun - yO;
  };

    const RtoPix = (d_pc) => {
      const a = distToPix(1);
      const b = distToPix(0.5);
      const R = a - b;
      console.log(R);
      return R;
    }
  

    const drawAll = () => {
      // Update the object distance from the slider
      d_pix = distToPix(distance_pc);
      R = RtoPix(distance_pc);
    
      // Earth position relative to top-left
      let xE_tl =  xSun + xE
      let yE_tl =  ySun + yE
    
      // Object position relative to top-left
      let xO_tl = xSun + xO
      let yO_tl = yO

      // Projected horizon position, relative to top-left
      let xH_tl = xSun - xE * yO / (yE_tl - yO)

      // Projected object motion
      let R1 = R * yO/ d_pix
      let theta_rad = theta_deg * Math.PI / 180
      let xP = R1 * Math.sin(-theta_rad)
      let yP = R1 * Math.cos(theta_rad) * Math.cos(inc_deg * Math.PI / 180)
      let xP_tl = viewCanvas.width/2 + xP
      let yP_tl = viewCanvas.height/2 + yP
    
      // Clear both canvas for a new frame
      ctx1.clearRect(0, 0, mainCanvas.width, mainCanvas.height);   
      ctx2.clearRect(0, 0, viewCanvas.width, viewCanvas.height);   
      
      ctx1.drawImage(backgroundImg, 0, 0, mainCanvas.width, mainCanvas.height);
      ctx2.drawImage(backgroundImg, 0, 0, mainCanvas.width, mainCanvas.height);

      // Draw the sun and far Earth orbit
      ctx1.fillStyle = "orange";
      ctx1.font = "14px Verdana";
      ctx1.textAlign="center"; 
      ctx1.fillText("The Sun", xSun, ySun + sunImg.height/2)
      drawFarEarthOrbit();
      drawSun();
    
      // Draw the angle sweep line
      ctx1.beginPath();
      ctx1.moveTo(xO_tl, yO_tl);
      ctx1.lineTo(xH_tl, 0);
      ctx1.moveTo(xO_tl, yO_tl);
      ctx1.lineTo(xE_tl, yE_tl);
      ctx1.setLineDash([7, 3])
      ctx1.lineWidth=2.0;
      ctx1.strokeStyle = 'grey';
      ctx1.stroke();

      // Draw the Earth
      ctx1.beginPath();
      ctx1.arc(xE_tl, yE_tl, 5, 0, 2*Math.PI);
      let grad = ctx1.createRadialGradient(xE_tl-1, yE_tl-2, 1,
                                            xE_tl, yE_tl, 5);
      grad.addColorStop(0, "#b3bdf8");
      grad.addColorStop(1, "blue");
      ctx1.fillStyle = grad;
      ctx1.fill();

      // Draw the foreground object
      xO_tl = xSun + xO
      yO_tl = yO
      ctx1.beginPath();
      ctx1.arc(xO_tl, yO_tl, 5, 0, 2*Math.PI);
      grad = ctx1.createRadialGradient(xO_tl-1, yO_tl-2, 1,
                                           xO_tl, yO_tl, 5);
      grad.addColorStop(0, "white");
      grad.addColorStop(1, "green");
      ctx1.fillStyle = grad;
      ctx1.fill();

      // Draw the angle annotation
      const ang = Math.atan(R/d_pix)
      const parAngle_asec = px/8401;
      const xArcEnd = xO_tl + annOff * Math.sin(ang)
      const yArcEnd = yO_tl- annOff * Math.cos(ang)
      ctx1.beginPath();
      ctx1.setLineDash([5, 5])
      ctx1.strokeStyle = "yellow";
      ctx1.lineWidth=1.0;
      ctx1.moveTo(xO_tl, yO_tl);
      ctx1.lineTo(xArcEnd, yArcEnd);
      ctx1.moveTo(xO_tl, yO_tl);
      ctx1.lineTo(xO_tl, yO_tl-annOff);
      ctx1.stroke();
      ctx1.beginPath();
      ctx1.setLineDash([1, 0])
      ctx1.lineWidth=3.0;
      ctx1.arc(xO_tl, yO_tl, annOff, -Math.PI/2, +ang-Math.PI/2);
      ctx1.stroke();
      //ctx1.stroke();
      //ctx1.lineTo(xO_tl, yO_tl);
      ctx1.fillStyle = "yellow";
      ctx1.font = "14px Verdana";
      ctx1.textAlign="start"; 
      var annTxt = "Angle = " + parAngle_asec.toFixed(2) + "''"
      ctx1.fillText(annTxt, xO_tl+annOff*Math.sin(ang)+ annOff*0.1,
                    yO_tl-annOff*Math.cos(ang)/2);

      // Draw projected orbit
      ctx2.beginPath();
      ctx2.setLineDash([7, 3])
      ctx2.strokeStyle = 'grey';
      ctx2.lineWidth=1.5;
      ctx2.ellipse(viewCanvas.width/2, viewCanvas.height/2, R1,
                   R1 * Math.cos(inc_deg * Math.PI / 180), 0, 0, 2*Math.PI)
      ctx2.stroke();

      // Draw projected angle line
      ctx2.beginPath();
      ctx2.setLineDash([3, 3])
      ctx2.strokeStyle = 'yellow';
      ctx2.lineWidth=1.0;
      ctx2.moveTo(viewCanvas.width/2, viewCanvas.height/2);
      ctx2.lineTo(viewCanvas.width/2+R1, viewCanvas.height/2);
      ctx2.stroke();
    
      // Draw view of object
      ctx2.beginPath();
      ctx2.arc(xP_tl, yP_tl, 5, 0, 2*Math.PI);
      grad = ctx1.createRadialGradient(xP_tl-1, yP_tl-2, 1,
                                           xP_tl, yP_tl, 5);
      grad.addColorStop(0, "white");
      grad.addColorStop(1, "green");
      ctx2.fillStyle = grad;
      ctx2.fill();

      // Print the month
      var months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November",
                  "December" ]
      ctx2.beginPath();
      ctx2.fillStyle = "grey";
      ctx2.font = "14px Verdana";
      ctx2.textAlign="start";
      ctx2.fillText(months[Math.floor(theta_deg/30)], 8,
                    viewCanvas.height-8)
    
      // Final annotations
      ctx1.beginPath();
      ctx1.fillStyle = "white";
      ctx1.font = "14px Verdana";
      ctx1.textAlign="start"; 
      ctx1.fillText("Not to scale.", 8, mainCanvas.height - 8)
      ctx1.fillText("Background stars.", 8, 12 + 8)
      ctx2.beginPath();
      ctx2.fillStyle = "white";
      ctx2.font = "14px Verdana";
      ctx2.textAlign="center"; 
      ctx2.fillText("View from Earth through a telescope.",
                    viewCanvas.width/2, 12 + 8)
    };

    function drawSun() {
        ctx1.drawImage(sunImg, xSun-sunImg.width/4, ySun-sunImg.height/4,
                      sunImg.width/2, sunImg.height/2);
      }

    function drawNearEarthOrbit() {
        ctx1.ellipse(xSun, ySun, R, R * Math.sin(inc_deg * Math.PI / 180.0),
                     0, 0, Math.PI)
        ctx1.setLineDash([7, 3])
        ctx1.lineWidth=2;
        ctx1.strokeStyle = 'grey';
        ctx1.stroke();
      }
             
      function drawFarEarthOrbit() {
        ctx1.ellipse(xSun, ySun, R, R * Math.sin(inc_deg * Math.PI / 180),
                     0, Math.PI, 0)
        ctx1.setLineDash([7, 3])
        ctx1.lineWidth=1.5;
        ctx1.strokeStyle = 'grey';
        ctx1.stroke();
  
        // Annotate the Earth
        ctx1.font = "14px Verdana";
        ctx1.fillStyle = '#6b72f8';
        ctx1.textAlign="end"; 
        ctx1.fillText("Earth", xSun-R-10, ySun+4)
        ctx1.textAlign="start"; 
      
      }

    const animate = () => {
      if (!isMounted.current) return;
      animationFrameId.current = requestAnimationFrame(animate);
      theta_deg += dTheta_deg;
      theta_deg %= 360;
      const theta_rad = theta_deg * Math.PI / 180;
      xE = R * Math.sin(theta_rad);
      yE = R * Math.cos(theta_rad) * Math.sin(inclination * Math.PI / 180);

      drawAll();

      // Draw the Sun and orbit line in the foreground during Earth eclipse
      if (theta_deg > 256 || theta_deg < 90) {
        drawNearEarthOrbit();
      } else {
        drawSun();
        drawNearEarthOrbit();
      }
    };

    let imagesLoaded = 0;
    const totalImages = 2;

    const startAnimationIfReady = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            R = RtoPix(distance_pc);
            animate();
        }
    };

    sunImg.onload = startAnimationIfReady;
    backgroundImg.onload = startAnimationIfReady;
  
    // Cleanup function
    return () => {
      isMounted.current = false; // Ensure no more frames are scheduled
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // ✅ Properly cancels animation
      }
    };
  }, [distance_pc, px]);

  return (
    <div>
      <canvas ref={mainCanvasRef} id="mainCanvas" width={300} height={400} />
      <canvas ref={viewCanvasRef} id="viewCanvas" width={300} height={400} />
    </div>
  );
};