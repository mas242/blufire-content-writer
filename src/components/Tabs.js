import React from 'react';

const Tabs = ({ currentStep, onTabClick }) => (
  <div className="tabs">
    <button className={`tab ${currentStep === 1 ? 'active' : ''}`} onClick={() => onTabClick(1)}>Step 1</button>
    <button className={`tab ${currentStep === 2 ? 'active' : ''}`} onClick={() => onTabClick(2)}>Step 2</button>
    <button className={`tab ${currentStep === 3 ? 'active' : ''}`} onClick={() => onTabClick(3)}>Step 3</button>
  </div>
);

export default Tabs;
