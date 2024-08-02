import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const Step = ({ stepNumber, currentStep, project, onGenerate, onNextSection, currentVersionIndex, setCurrentVersionIndex }) => {
  const [wordCount, setWordCount] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [semanticKeywords, setSemanticKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStep1Version, setSelectedStep1Version] = useState(0);

  useEffect(() => {
    const currentStepData = project.steps[stepNumber];
    if (currentStepData && currentStepData.length > 0) {
      const latestVersion = currentStepData[currentVersionIndex];
      setWordCount(latestVersion.wordCount || "");
      setPrimaryKeyword(latestVersion.primaryKeyword || "");
      setSecondaryKeywords(latestVersion.secondaryKeywords || "");
      setSemanticKeywords(latestVersion.semanticKeywords || "");
    } else {
      // Reset input values if no versions exist
      setWordCount("");
      setPrimaryKeyword("");
      setSecondaryKeywords("");
      setSemanticKeywords("");
    }
  }, [currentVersionIndex, project, stepNumber]);

  if (stepNumber !== currentStep) return null;

  const handleGenerateClick = async () => {
    setLoading(true);
    const message = `Word count: ${wordCount} words | Primary keyword: ${primaryKeyword} | Secondary keywords: ${secondaryKeywords} | Semantically related keywords: ${semanticKeywords}`;
    const inputValues = {
      wordCount,
      primaryKeyword,
      secondaryKeywords,
      semanticKeywords,
      message
    };
    await onGenerate(inputValues, stepNumber);
    setLoading(false);
  };

  const handleStartClick = async () => {
    setLoading(true);
    const step1Version = project.steps[1][selectedStep1Version];
    const message = `
      Here is a content outline. Split the sections into SEPARATE RESPONSES to ensure the appropriate word count is met for every section. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Version.wordCount}
      primaryKeyword: ${step1Version.primaryKeyword}
      secondaryKeywords: ${step1Version.secondaryKeywords}
      semanticKeywords: ${step1Version.semanticKeywords}
    `;
    await onGenerate({ message, step: 2, threadId: project.steps[2].threadId });
    setLoading(false);
  };

  const handleNextSectionClick = async () => {
    setLoading(true);
    await onNextSection(stepNumber, project.steps[2].threadId);
    setLoading(false);
  };

  const handleGenerateFullArticleClick = async () => {
    setLoading(true);
    const step1Version = project.steps[1][selectedStep1Version];
    const message = `
      Here is a content outline. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Version.wordCount}
      primaryKeyword: ${step1Version.primaryKeyword}
      secondaryKeywords: ${step1Version.secondaryKeywords}
      semanticKeywords: ${step1Version.semanticKeywords}
    `;
    await onGenerate({ message, step: 2, threadId: project.steps[2].threadId });
    setLoading(false);
  };

  const handleVersionChange = (direction) => {
    const newVersionIndex = direction === 'next'
      ? Math.min(currentVersionIndex + 1, project.steps[stepNumber].length - 1)
      : Math.max(currentVersionIndex - 1, 0);
    setCurrentVersionIndex(newVersionIndex);
  };

  return (
    <div className="step active">
      <div className="content">
        {project.steps[stepNumber].length > 0 && (
          <div className="large-text-area-container" style={{ position: 'relative' }}>
            <textarea className="large-text-area" value={project.steps[stepNumber][currentVersionIndex].response || ""} readOnly />
            {loading && <Spinner />}
            <div className="version-indicator">
              <span>Version</span>
              <div>
                <button onClick={() => handleVersionChange('prev')} disabled={loading || currentVersionIndex === 0}>&lt;</button>
                <span>{project.steps[stepNumber].length === 0 ? 0 : currentVersionIndex + 1} / {project.steps[stepNumber].length}</span>
                <button onClick={() => handleVersionChange('next')} disabled={loading || currentVersionIndex === project.steps[stepNumber].length - 1}>&gt;</button>
              </div>
            </div>
          </div>
        )}
        {stepNumber === 1 && (
          <>
            <div className="inputs">
              <input type="number" placeholder="Word Count" value={wordCount} onChange={(e) => setWordCount(e.target.value)} />
              <input type="text" placeholder="Primary Keyword" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} />
            </div>
            <div className="keywords">
              <textarea placeholder="Secondary Keywords" value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)}></textarea>
              <textarea placeholder="Semantically Related Keywords" value={semanticKeywords} onChange={(e) => setSemanticKeywords(e.target.value)}></textarea>
            </div>
            <button onClick={handleGenerateClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Outline</button>
          </>
        )}
        {stepNumber === 2 && (
          <>
            <div className="controls">
              <select onChange={(e) => setSelectedStep1Version(e.target.value)}>
                {project.steps[1].map((response, index) => (
                  <option key={index} value={index}>
                    Version {index + 1}
                  </option>
                ))}
              </select>
              <button onClick={handleStartClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Start</button>
              <button onClick={handleNextSectionClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Next Section</button>
            </div>
            <button onClick={handleGenerateFullArticleClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Full Article</button>
            <button onClick={() => alert('Proofreading...')}>Proofread</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Step;
