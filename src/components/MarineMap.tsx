import React from 'react';

export function MarineMap() {
  return (
    <div className="w-full h-full">
      <iframe
        src="https://www.myshiptracking.com/estimate?pid=3443"
        width="100%"
        height="100%"
        frameBorder="0"
        title="ميناء ينبع - تتبع السفن"
        className="w-full h-full"
      />
    </div>
  );
}