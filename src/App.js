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

  const handleGenerate = async (inputValues) => {
    const { message, step, wordCount, primaryKeyword, secondaryKeywords, semanticKeywords } = inputValues;
    try {
      let threadId = threadIds[step];
      if (!threadId) {
        const data = await startConversation(step);
        threadId = data.thread_id;
        setThreadIds({ ...threadIds, [step]: threadId });
      }

      const response = await sendMessage(threadId, message, step);
      const newResponses = { ...responses };
      if (!newResponses[step]) {
        newResponses[step] = [];
      }
      newResponses[step].push({ response: response.response, thread_id: threadId, wordCount, primaryKeyword, secondaryKeywords, semanticKeywords });
      setResponses(newResponses);
      setCurrentVersions({ ...currentVersions, [step]: newResponses[step].length - 1 });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextSection = async (step) => {
    try {
      const currentVersion = responses[step][currentVersions[step]];
      const threadId = currentVersion.thread_id;
      const message = "Please Generate Next Sections";

      const response = await sendMessage(threadId, message, step);
      const newResponses = { ...responses };
      newResponses[step][currentVersions[step]].response += `\n${response.response}`;
      setResponses(newResponses);
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
          onGenerate={(inputValues) => handleGenerate(inputValues)}
          onNextSection={() => handleNextSection(step)}
          step1Responses={responses[1] || []} // Pass Step 1 responses to Step component
        />
      ))}
    </div>
  );
}

export default App;
