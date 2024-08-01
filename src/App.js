import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Step from './components/Step';
import { saveToLocalStorage, getFromLocalStorage, startConversation, sendMessage } from './utils/utils';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [threadIds, setThreadIds] = useState(getFromLocalStorage('threadIds') || {});
  const [responses, setResponses] = useState(getFromLocalStorage('responses') || {});
  const [currentVersions, setCurrentVersions] = useState({ 1: 0, 2: 0, 3: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    saveToLocalStorage('threadIds', threadIds);
  }, [threadIds]);

  useEffect(() => {
    saveToLocalStorage('responses', responses);
  }, [responses]);

  const handleTabClick = (step) => {
    setCurrentStep(step);
  };

  const handleGenerate = async (step, inputValues) => {
    try {
      let threadId = threadIds[step];
      if (!threadId) {
        const data = await startConversation(step);
        threadId = data.thread_id;
        setThreadIds({ ...threadIds, [step]: threadId });
      }

      const message = `Word count: ${inputValues.wordCount} words | Primary keyword: ${inputValues.primaryKeyword} | Secondary keywords: ${inputValues.secondaryKeywords} | Semantically related keywords: ${inputValues.semanticKeywords}`;
      const response = await sendMessage(threadId, message, step);

      const newResponses = { ...responses };
      if (!newResponses[step]) {
        newResponses[step] = [];
      }
      newResponses[step].push({ response: response.response, ...inputValues });
      setResponses(newResponses);
      setCurrentVersions({ ...currentVersions, [step]: newResponses[step].length - 1 });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVersionChange = (step, direction) => {
    const newVersionIndex = direction === 'next' 
      ? Math.min(currentVersions[step] + 1, responses[step].length - 1) 
      : Math.max(currentVersions[step] - 1, 0);
    
    setCurrentVersions({ ...currentVersions, [step]: newVersionIndex });
  };

  return (
    <div className="container">
      <Header />
      <Tabs currentStep={currentStep} onTabClick={handleTabClick} />
      {error && <div className="error">{error}</div>}
      {[1, 2, 3].map(step => (
        <Step
          key={step}
          stepNumber={step}
          currentStep={currentStep}
          versions={responses[step] || [""]}
          currentVersionIndex={currentVersions[step]}
          onVersionChange={(direction) => handleVersionChange(step, direction)}
          onGenerate={(inputValues) => handleGenerate(step, inputValues)}
        />
      ))}
    </div>
  );
}

export default App;
