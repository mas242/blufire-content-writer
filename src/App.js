import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Step from './components/Step';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [versionsStep1, setVersionsStep1] = useState([/* initial data */]);
  const [versionsStep2, setVersionsStep2] = useState([/* initial data */]);

  const handleTabClick = (step) => {
    setCurrentStep(step);
  };

  const handleVersionChange = (step, direction) => {
    // Handle version change logic
  };

  return (
    <div className="container">
      <Header />
      <Tabs currentStep={currentStep} onTabClick={handleTabClick} />
      <Step
        stepNumber={1}
        currentStep={currentStep}
        versions={versionsStep1}
        onVersionChange={(direction) => handleVersionChange(1, direction)}
      />
      <Step
        stepNumber={2}
        currentStep={currentStep}
        versions={versionsStep2}
        onVersionChange={(direction) => handleVersionChange(2, direction)}
      />
      <Step
        stepNumber={3}
        currentStep={currentStep}
      />
    </div>
  );
}

export default App;
