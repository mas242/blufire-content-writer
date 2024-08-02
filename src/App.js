import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Step from './components/Step';
import ProjectList from './components/ProjectList';
import { saveToLocalStorage, getFromLocalStorage, startConversation, sendMessage } from './utils/utils';

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState(getFromLocalStorage('projects') || []);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    saveToLocalStorage('projects', projects);
  }, [projects]);

  useEffect(() => {
    const savedCurrentProjectId = getFromLocalStorage('currentProjectId');
    if (savedCurrentProjectId) {
      setCurrentProjectId(savedCurrentProjectId);
    }
  }, []);

  useEffect(() => {
    if (currentProjectId !== null) {
      saveToLocalStorage('currentProjectId', currentProjectId);
    }
  }, [currentProjectId]);

  const handleTabClick = (step) => {
    setCurrentStep(step);
  };

  const handleCreateProject = (name, description) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      steps: { 1: [], 2: [], 3: [] },
      currentVersions: { 1: 0, 2: 0, 3: 0 }
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleEditProject = (projectId, name, description) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId ? { ...project, name, description } : project
    );
    setProjects(updatedProjects);
  };

  const handleRemoveProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  const handleExportProject = (projectId) => {
    const project = projects.find(project => project.id === projectId);
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const importedProject = JSON.parse(event.target.result);
      setProjects([...projects, importedProject]);
    };
    reader.readAsText(file);
  };

  const handleClearStorage = () => {
    setProjects([]);
    setCurrentProjectId(null);
  };

  const handleSelectProject = (projectId) => {
    setCurrentProjectId(projectId);
  };

  const handleGenerate = async (inputValues, step) => {
    const project = projects.find(project => project.id === currentProjectId);
    if (!project) return;

    try {
      let threadId = project.steps[step].threadId;
      if (!threadId) {
        const data = await startConversation(step);
        threadId = data.thread_id;
        project.steps[step].threadId = threadId;
        setProjects([...projects]);
      }

      const response = await sendMessage(threadId, inputValues.message, step);
      const newStepData = { ...inputValues, response: response.response, thread_id: threadId };
      project.steps[step].push(newStepData);
      project.currentVersions[step] = project.steps[step].length - 1; // Automatically select the new version
      setProjects([...projects]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextSection = async (step) => {
    const project = projects.find(project => project.id === currentProjectId);
    if (!project) return;

    try {
      const currentVersion = project.steps[step][project.currentVersions[step]];
      const threadId = currentVersion.thread_id;
      const message = "Please Generate Next Sections";

      const response = await sendMessage(threadId, message, step);
      currentVersion.response += `\n${response.response}`;
      setProjects([...projects]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <ProjectList
          projects={projects}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onRemoveProject={handleRemoveProject}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
          onSelectProject={handleSelectProject}
          currentProjectId={currentProjectId}
          onClearStorage={handleClearStorage}
        />
        <div className="content">
          <Tabs currentStep={currentStep} onTabClick={handleTabClick} />
          {error && <div className="error">{error}</div>}
          {currentProjectId && (
            <Step
              stepNumber={currentStep}
              currentStep={currentStep}
              project={projects.find(project => project.id === currentProjectId)}
              onGenerate={handleGenerate}
              onNextSection={handleNextSection}
              currentVersionIndex={projects.find(project => project.id === currentProjectId).currentVersions[currentStep]}
              setCurrentVersionIndex={(index) => {
                const updatedProjects = projects.map(project => {
                  if (project.id === currentProjectId) {
                    project.currentVersions[currentStep] = index;
                  }
                  return project;
                });
                setProjects(updatedProjects);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
