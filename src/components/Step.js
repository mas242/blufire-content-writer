import React from 'react';

const Step = ({ stepNumber, currentStep, versions = [""], onVersionChange }) => {
  if (stepNumber !== currentStep) return null;

  return (
    <div className="step active">
      <div className="content">
        {versions && (
          <div className="large-text-area-container">
            <textarea className="large-text-area" defaultValue={versions[versions.length - 1]} />
            <div className="version-indicator">
              <span>Version</span>
              <div>
                <button onClick={() => onVersionChange('prev')}>&lt;</button>
                <span>{versions.length}</span>
                <button onClick={() => onVersionChange('next')}>&gt;</button>
              </div>
            </div>
          </div>
        )}
        {stepNumber === 1 && (
          <>
            <div className="inputs">
              <input type="number" placeholder="Word Count" />
              <input type="text" placeholder="Primary Keyword" />
            </div>
            <div className="keywords">
              <textarea placeholder="Secondary Keywords"></textarea>
              <textarea placeholder="Semantically Related Keywords"></textarea>
            </div>
            <button onClick={() => alert('Generating outline...')}>Generate Outline</button>
          </>
        )}
        {stepNumber === 2 && (
          <>
            <div className="controls">
              <input type="number" placeholder="Version" min="0" />
              <button onClick={() => alert('Starting...')}>Start</button>
              <button onClick={() => alert('Next section...')}>Next Section</button>
            </div>
            <button onClick={() => alert('Generating full article...')}>Generate Full Article</button>
            <button onClick={() => alert('Proofreading...')}>Proofread</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Step;
