import React, { useRef, useEffect, useState } from "react";

export const SliderControl = ({ label, value, min, max, onChange, unit }) => {
  return (
    <div>
      <label>{label}: {value}{unit}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

