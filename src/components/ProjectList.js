import React, { useState, useEffect, useRef } from 'react';
import './ProjectList.css';

const ProjectList = ({ projects, onCreateProject, onEditProject, onRemoveProject, onExportProject, onImportProject, onSelectProject, currentProjectId, onClearStorage }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const projectNameInputRef = useRef(null);

  useEffect(() => {
    if (showDialog) {
      projectNameInputRef.current.focus();
    }
  }, [showDialog]);

  const handleCreate = () => {
    setEditProjectId(null);
    setProjectName('');
    setProjectDescription('');
    setShowDialog(true);
  };

  const handleEdit = (project) => {
    setEditProjectId(project.id);
    setProjectName(project.name);
    setProjectDescription(project.description);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editProjectId) {
      onEditProject(editProjectId, projectName, projectDescription);
    } else {
      onCreateProject(projectName, projectDescription);
    }
    setShowDialog(false);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportProject(file);
    }
  };

  return (
    <div className="project-list">
      <div className="project-functions">
        <button className="small-button add-project-button" onClick={handleCreate}>New Project</button>
        <label className="small-button upload-project-label">
          <span>+</span> Upload Project
          <input type="file" accept="application/json" onChange={handleImport} />
        </label>
        <button className="small-button remove-all-button" onClick={onClearStorage}>Remove All Projects</button>
      </div>
      <ul className="project-list-items">
        {projects.map(project => (
          <li key={project.id} className={currentProjectId === project.id ? 'active' : ''}>
            <span onClick={() => onSelectProject(project.id)}>{project.name}</span>
            <div className="project-buttons">
              <button onClick={() => handleEdit(project)} className="small-button darkred-button">Edit</button>
              <button onClick={() => onRemoveProject(project.id)} className="small-button darkred-button">Remove</button>
              <button onClick={() => onExportProject(project.id)} className="small-button darkred-button">Export</button>
            </div>
          </li>
        ))}
      </ul>
      {showDialog && (
        <div className="dialog">
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            ref={projectNameInputRef}
          />
          <textarea
            placeholder="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          ></textarea>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowDialog(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
