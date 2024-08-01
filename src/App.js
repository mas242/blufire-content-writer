import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Step from './components/Step';
import ProjectList from './components/ProjectList';
import { saveToLocalStorage, getFromLocalStorage, startConversation, sendMessage } from './utils/utils';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState(getFromLocalStorage('projects') || []);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [threadIds, setThreadIds] = useState({});
  const [responses, setResponses] = useState({});
  const [currentVersions, setCurrentVersions] = useState({ 1: 0, 2: 0, 3: 0 });
  const [error, setError] = useState(null);

  // State for Step 1 input values
  const [step1Inputs, setStep1Inputs] = useState({
    wordCount: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    semanticKeywords: ''
  });

  useEffect(() => {
    if (currentProjectId !== null) {
      saveToLocalStorage('projects', projects);
    }
  }, [projects, currentProjectId]);

  useEffect(() => {
    if (currentProjectId !== null) {
      const project = projects.find(proj => proj.id === currentProjectId);
      if (project) {
        setThreadIds(project.threadIds || {});
        setResponses(project.responses || {});
        setCurrentVersions(project.currentVersions || { 1: 0, 2: 0, 3: 0 });
      }
    }
  }, [currentProjectId, projects]);

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
      updateProjectData({ threadIds, responses: newResponses, currentVersions });
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
      updateProjectData({ threadIds, responses: newResponses, currentVersions });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProofread = async () => {
    const step2VersionIndex = currentVersions[2];
    const step2Version = responses[2][step2VersionIndex];
    const message = `
      Here is an article please keep the final word count around ${step2Version.wordCount} words. Use Multiple responses if necessary. Include Markdown Formatting in final responses.
      ${step2Version.response}
    `;
    const step = 3;
    try {
      const data = await startConversation(step);
      const threadId = data.thread_id;
      setThreadIds({ ...threadIds, [step]: threadId });

      const response = await sendMessage(threadId, message, step);
      const newResponses = { ...responses };
      if (!newResponses[step]) {
        newResponses[step] = [];
      }
      newResponses[step].push({ response: response.response, step2VersionIndex });
      setResponses(newResponses);
      setCurrentVersions({ ...currentVersions, [step]: newResponses[step].length - 1 });
      updateProjectData({ threadIds, responses: newResponses, currentVersions });
      setCurrentStep(3);
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
    updateProjectData({ threadIds, responses, currentVersions: { ...currentVersions, [step]: newVersionIndex } });
  };

  const handleClearStorage = () => {
    localStorage.clear();
    setThreadIds({});
    setResponses({});
    setCurrentVersions({ 1: 0, 2: 0, 3: 0 });
    setCurrentStep(1);
    setStep1Inputs({
      wordCount: '',
      primaryKeyword: '',
      secondaryKeywords: '',
      semanticKeywords: ''
    });
  };

  const updateProjectData = (data) => {
    setProjects(projects.map(proj => proj.id === currentProjectId ? { ...proj, ...data } : proj));
  };

  const handleCreateProject = (name, description) => {
    const newProject = {
      id: Date.now(),
      name,
      description,
      threadIds: {},
      responses: {},
      currentVersions: { 1: 0, 2: 0, 3: 0 }
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleEditProject = (id, name, description) => {
    setProjects(projects.map(proj => proj.id === id ? { ...proj, name, description } : proj));
  };

  const handleExportProject = (id) => {
    const project = projects.find(proj => proj.id === id);
    if (project) {
      const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportProject = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const importedProject = JSON.parse(event.target.result);
      setProjects([...projects, importedProject]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      <Header onClearStorage={handleClearStorage} />
      <div className="main-content">
        <ProjectList
          projects={projects}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
          onSelectProject={setCurrentProjectId}
          currentProjectId={currentProjectId}
        />
        <div className="content">
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
              onProofread={handleProofread}
              step1Responses={responses[1] || []} // Pass Step 1 responses to Step component
              step2Versions={responses[2] || []} // Pass Step 2 responses to Step component
              step1Inputs={step1Inputs} // Pass Step 1 input values to Step component
              setStep1Inputs={setStep1Inputs} // Pass setState function for Step 1 input values to Step component
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
