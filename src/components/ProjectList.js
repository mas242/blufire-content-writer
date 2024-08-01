import React, { useState } from 'react';
import './ProjectList.css';

const ProjectList = ({ projects, onCreateProject, onEditProject, onExportProject, onImportProject, onSelectProject, currentProjectId }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

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
      <div className="project-list-header">
        <button className="add-project-button" onClick={handleCreate}>+</button>
        <input type="file" accept="application/json" onChange={handleImport} />
      </div>
      <ul>
        {projects.map(project => (
          <li key={project.id} className={currentProjectId === project.id ? 'active' : ''}>
            <span onClick={() => onSelectProject(project.id)}>{project.name}</span>
            <button onClick={() => handleEdit(project)}>Edit</button>
            <button onClick={() => onExportProject(project.id)}>Export</button>
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
