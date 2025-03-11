import React, { useEffect, useRef, useState } from 'react';
import { roundToTwoDigits } from '../../lib';

const canvasWidth = window.innerWidth*0.4;
const canvasHeight = window.innerHeight*0.8;

export const ParallaxSimulation = ({distance_pc, px, color}) => {

// Constants and variables
  const dTheta_deg = 1;
  const yOMin = 70;
  const yOMax = canvasHeight-80;
  const xSun = canvasWidth/2;
  const ySun = canvasHeight-50;
  const annOff = 60;
  const inc_deg = 7;


  const objectPos = (d_pc) => {
    // Distance in parsecs
    const A = 1; // Adjust based on visualization size
    const B = 0; // Adjust based on visualization offset

    // Define minimum and maximum distances in parsecs
    const dMin_pc = 3.4;
    const dMax_pc = 8401;

    // Apply logarithmic transformation to distances
    const log_d_pc = A * Math.log10(d_pc) + B;
    const log_dMin_pc = A * Math.log10(dMin_pc) + B;
    const log_dMax_pc = A * Math.log10(dMax_pc) + B;

    // Map logarithmic distance to pixel range
    const tmp = (log_d_pc - log_dMin_pc) * (yOMax - yOMin) / (log_dMax_pc - log_dMin_pc);
    let yO = yOMax - tmp;
    return yO;
  }

  const distToPix = (d_pc) => {
    // Calculate pixel distance
    return ySun - objectPos(d_pc);
  };

  const RtoPix = (d_pc) => {
    return distToPix(1) - distToPix(0.5);
  }

  const calculatePositions = () => {
    // Separate function for calculations
    theta_deg.current = (theta_deg.current + dTheta_deg) % 360;
    const theta_rad = theta_deg.current * Math.PI / 180;
    xE.current = animationParamsRef.current.R * Math.sin(theta_rad);
    yE.current = animationParamsRef.current.R * Math.cos(theta_rad) * Math.sin(inc_deg * Math.PI / 180);
  };

  const mainCanvasRef = useRef(null);
  const viewCanvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const isMounted = useRef(false);
  const animationParamsRef = useRef({
    R: RtoPix(distance_pc),
    d_pix: distToPix(distance_pc),
    yO: objectPos(distance_pc),
  });
  const theta_deg = useRef(0);
  const xE = useRef(0);
  const yE = useRef(0);
  const [sunImgLoaded, setSunImgLoaded] = useState(false);
  const [bgImgLoaded, setBgImgLoaded] = useState(false);

  // Load images once
  const sunImg = useRef(new Image());
  const bgImg = useRef(new Image());

  useEffect(() => {
    sunImg.current.src = `/assets/images/sun.png`;
    sunImg.current.onload = () => setSunImgLoaded(true);

    bgImg.current.src = `/assets/images/star_field.png`;
    bgImg.current.onload = () => setBgImgLoaded(true);
  }, []);

    // If distance_pc changes, update initial animation parameters
    useEffect(() => {
      animationParamsRef.current = {
        R: RtoPix(distance_pc),
        d_pix: distToPix(distance_pc),
        yO: objectPos(distance_pc)
      };
    }, [distance_pc]);

  const drawBackground = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(bgImg.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const drawEarth = (ctx, xE_tl, yE_tl) => {
    ctx.beginPath();
    ctx.arc(xE_tl, yE_tl, 5, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(xE_tl - 1, yE_tl - 2, 1, xE_tl, yE_tl, 5);
    grad.addColorStop(0, "#b3bdf8");
    grad.addColorStop(1, "blue");
    ctx.fillStyle = grad;
    ctx.fill();
  };

  const drawObject = (ctx, xO_tl, yO_tl) => {
    ctx.beginPath();
    ctx.arc(xO_tl, yO_tl, 5, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(xO_tl - 1, yO_tl - 2, 1, xO_tl, yO_tl, 5);
    grad.addColorStop(0, "white");
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
  };

  const drawForegroundObject = (ctx, xO_tl, yO_tl) => {
    xO_tl = xSun
    ctx.beginPath();
    ctx.arc(xO_tl, yO_tl, 5, 0, 2*Math.PI);
    const grad = ctx.createRadialGradient(xO_tl-1, yO_tl-2, 1,
                                         xO_tl, yO_tl, 5);
    grad.addColorStop(0, "white");
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
  };

  const drawAngleAnnotation = (ctx, xO_tl, yO_tl) => {
    const ang = Math.atan(animationParamsRef.current.R/animationParamsRef.current.d_pix)
    const parAngle_asec = 1/distance_pc;
    const xArcEnd = xO_tl + annOff * Math.sin(ang)
    const yArcEnd = yO_tl- annOff * Math.cos(ang)
    ctx.beginPath();
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "yellow";
    ctx.lineWidth=1.0;
    ctx.moveTo(xO_tl, yO_tl);
    ctx.lineTo(xArcEnd, yArcEnd);
    ctx.moveTo(xO_tl, yO_tl);
    ctx.lineTo(xO_tl, yO_tl-annOff);
    ctx.stroke();
    ctx.beginPath();
    ctx.setLineDash([1, 0])
    ctx.lineWidth=3.0;
    ctx.arc(xO_tl, yO_tl, annOff, -Math.PI/2, +ang-Math.PI/2);
    ctx.stroke();
    ctx.fillStyle = "yellow";
    ctx.font = "14px Verdana";
    ctx.textAlign="start"; 
    var annTxt = "Parallax Angle = " + parAngle_asec.toFixed(3) + "''"
    ctx.fillText(annTxt, xO_tl+annOff*Math.sin(ang)+ annOff*0.1,
                  yO_tl-annOff*Math.cos(ang)/2);
  };

  const drawProjectedOrbit = (ctx, R1) => {
    ctx.beginPath();
    ctx.setLineDash([7, 3])
    ctx.strokeStyle = 'grey';
    ctx.lineWidth=1.5;
    ctx.ellipse(canvasWidth/2, canvasHeight/2, R1,
                  R1 * Math.cos(inc_deg * Math.PI / 180), 0, 0, 2*Math.PI);
    ctx.stroke();
  }

  const drawAngleSweepLine = (ctx, xO_tl, yO_tl, xE_tl, yE_tl) => {
    let xH_tl = xSun - (animationParamsRef.current.yO * xE.current) / (yE_tl - animationParamsRef.current.yO);
    ctx.beginPath();
    ctx.moveTo(xO_tl, yO_tl);
    ctx.lineTo(xH_tl, 0);
    ctx.moveTo(xO_tl, yO_tl);
    ctx.lineTo(xE_tl, yE_tl);
    ctx.setLineDash([7, 3])
    ctx.lineWidth=2.0;
    ctx.strokeStyle = 'grey';
    ctx.stroke();
  }

  const drawProjectedAngleLine = (ctx, R1) => {
    ctx.beginPath();
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth=1.0;
    ctx.moveTo(canvasWidth/2, canvasHeight/2);
    ctx.lineTo(canvasWidth/2+R1, canvasHeight/2);
    ctx.stroke();
  }

  const drawViewOfObject = (ctx, xP_tl, yP_tl) => {
    
    ctx.beginPath();
    ctx.arc(xP_tl, yP_tl, 5, 0, 2*Math.PI);
    const grad = ctx.createRadialGradient(xP_tl-1, yP_tl-2, 1,
                                          xP_tl, yP_tl, 5);
    grad.addColorStop(0, "white");
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  const printMonths = (ctx) => {
    var months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November",
      "December" ]
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.font = "14px Verdana";
    ctx.textAlign="start";
    ctx.fillText(months[Math.floor(theta_deg.current/30)], 8,
            canvasHeight-8)
  }

  const annotate = (ctx, text, left, top) => {
    // Final annotations
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "14px Verdana";
    ctx.textAlign="start"; 
    ctx.fillText(text, left, top);
  }

  const drawSun = (ctx) => {
    ctx.drawImage(sunImg.current, xSun-sunImg.current.width/4, ySun-sunImg.current.height/4,
                  sunImg.current.width/2, sunImg.current.height/2);
  }

  const drawNearEarthOrbit = (ctx) => {
    ctx.ellipse(xSun, ySun, animationParamsRef.current.R, animationParamsRef.current.R * Math.sin(inc_deg * Math.PI / 180.0),
                 0, 0, Math.PI)
    ctx.setLineDash([7, 3])
    ctx.lineWidth=2;
    ctx.strokeStyle = 'grey';
    ctx.stroke();
  }
         
  const drawFarEarthOrbit = (ctx) => {
    ctx.ellipse(xSun, ySun, animationParamsRef.current.R, animationParamsRef.current.R * Math.sin(inc_deg * Math.PI / 180),
                 0, Math.PI, 0)
    ctx.setLineDash([7, 3])
    ctx.lineWidth=1.5;
    ctx.strokeStyle = 'grey';
    ctx.stroke();

    // Annotate the Earth
    ctx.font = "14px Verdana";
    ctx.fillStyle = '#6b72f8';
    ctx.textAlign="end"; 
    ctx.fillText("Earth", xSun-animationParamsRef.current.R-10, ySun+4)
    ctx.textAlign="start"; 
  
  }

  useEffect(() => {
    isMounted.current = true;
    const ctx1 = mainCanvasRef.current.getContext('2d');
    const ctx2 = viewCanvasRef.current.getContext('2d');

    const drawAll = () => {

  
      // Earth position relative to top-left
      let xE_tl =  xSun + xE.current;
      let yE_tl =  ySun + yE.current;
    
      // Object position relative to top-left
      let xO_tl = xSun;
      let yO_tl = animationParamsRef.current.yO;

      // Projected object motion
      let R1 = animationParamsRef.current.R * animationParamsRef.current.yO / animationParamsRef.current.d_pix;
      let theta_rad = theta_deg.current * Math.PI / 180;
      let xP = R1 * Math.sin(-theta_rad);
      let yP = R1 * Math.cos(theta_rad) * Math.cos(inc_deg * Math.PI / 180);
      let xP_tl = canvasWidth/2 + xP;
      let yP_tl = canvasHeight/2 + yP;

      ctx1.fillStyle = "orange";
      ctx1.font = "14px Verdana";
      ctx1.textAlign="center"; 
      ctx1.fillText("The Sun", xSun, ySun + sunImg.current.height/2)
    
      drawBackground(ctx1);
      drawBackground(ctx2);
      drawFarEarthOrbit(ctx1);
      drawSun(ctx1);
      drawObject(ctx1, xSun, animationParamsRef.current.yO);
      drawEarth(ctx1, xSun + xE.current, ySun + yE.current);
      drawAngleSweepLine(ctx1, xO_tl, yO_tl, xE_tl, yE_tl);
      drawForegroundObject(ctx1, xO_tl, yO_tl);
      drawAngleAnnotation(ctx1, xO_tl, yO_tl);
      drawProjectedOrbit(ctx2, R1);
      drawProjectedAngleLine(ctx2, R1);
      drawViewOfObject(ctx2, xP_tl, yP_tl);
      printMonths(ctx2);
      annotate(ctx1, "Not to scale.", 8, canvasHeight - 8)
      annotate(ctx1, "Background stars.", 8, 20)
      annotate(ctx2, "View from Earth through a telescope.",
                10, 20)  
    };

    const animate = () => {
      if (!isMounted.current) return;
      animationFrameId.current = requestAnimationFrame(animate);

      calculatePositions();

      drawAll();

      // Draw the Sun and orbit line in the foreground during Earth eclipse
      if (theta_deg.current > 256 || theta_deg.current < 90) {
        drawNearEarthOrbit(ctx1);
      } else {
        drawSun(ctx1);
        drawNearEarthOrbit(ctx1);
      }
    };

    if (sunImgLoaded && bgImgLoaded) {
      animate();
    }
  
    // Cleanup function
    return () => {
      isMounted.current = false; // Ensure no more frames are scheduled
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // ✅ Properly cancels animation
      }
    };
  }, [sunImgLoaded, bgImgLoaded, distance_pc]);

  return (
    <div>
      <canvas ref={mainCanvasRef} id="mainCanvas" width={canvasWidth} height={canvasHeight} />
      <canvas ref={viewCanvasRef} id="viewCanvas" width={canvasWidth} height={canvasHeight} />
    </div>
  );
};