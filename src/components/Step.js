import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const Step = ({ stepNumber, currentStep, versions = [""], currentVersionIndex, onVersionChange, onGenerate, onNextSection, step1Responses }) => {
  const [wordCount, setWordCount] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [semanticKeywords, setSemanticKeywords] = useState("");
  const [selectedStep1Version, setSelectedStep1Version] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (versions[currentVersionIndex]) {
      const versionData = versions[currentVersionIndex];
      setWordCount(versionData.wordCount || "");
      setPrimaryKeyword(versionData.primaryKeyword || "");
      setSecondaryKeywords(versionData.secondaryKeywords || "");
      setSemanticKeywords(versionData.semanticKeywords || "");
    }
  }, [currentVersionIndex, versions]);

  useEffect(() => {
    // Retrieve and set input values from local storage for Step 1
    if (stepNumber === 1 && currentStep === 1) {
      const savedWordCount = localStorage.getItem('wordCount');
      const savedPrimaryKeyword = localStorage.getItem('primaryKeyword');
      const savedSecondaryKeywords = localStorage.getItem('secondaryKeywords');
      const savedSemanticKeywords = localStorage.getItem('semanticKeywords');
      
      if (savedWordCount) setWordCount(savedWordCount);
      if (savedPrimaryKeyword) setPrimaryKeyword(savedPrimaryKeyword);
      if (savedSecondaryKeywords) setSecondaryKeywords(savedSecondaryKeywords);
      if (savedSemanticKeywords) setSemanticKeywords(savedSemanticKeywords);
    }
  }, [stepNumber, currentStep]);

  if (stepNumber !== currentStep) return null;

  const handleGenerateClick = async () => {
    setLoading(true);

    // Save input values to local storage
    localStorage.setItem('wordCount', wordCount);
    localStorage.setItem('primaryKeyword', primaryKeyword);
    localStorage.setItem('secondaryKeywords', secondaryKeywords);
    localStorage.setItem('semanticKeywords', semanticKeywords);

    const message = `
      Word count: ${wordCount}+ words | Primary keyword: ${primaryKeyword} | Secondary keywords: ${secondaryKeywords} | Semantically related keywords: ${semanticKeywords}
    `;
    const inputValues = {
      message,
      step: stepNumber,
      wordCount,
      primaryKeyword,
      secondaryKeywords,
      semanticKeywords
    };
    await onGenerate(inputValues);
    setLoading(false);
  };

  const handleStartClick = async () => {
    setLoading(true);
    const step1Version = step1Responses[selectedStep1Version];
    const message = `
      Here is a content outline. Split the sections into SEPARATE RESPONSES to ensure the appropriate word count is met for every section. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Version.wordCount}
      primaryKeyword: ${step1Version.primaryKeyword}
      secondaryKeywords: ${step1Version.secondaryKeywords}
      semanticKeywords: ${step1Version.semanticKeywords}
    `;
    await onGenerate({ message, step: 2 });
    setLoading(false);
  };

  const handleNextSectionClick = async () => {
    setLoading(true);
    await onNextSection(2);
    setLoading(false);
  };

  const handleGenerateFullArticleClick = async () => {
    setLoading(true);
    const step1Version = step1Responses[selectedStep1Version];
    const message = `
      Here is a content outline. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Version.wordCount}
      primaryKeyword: ${step1Version.primaryKeyword}
      secondaryKeywords: ${step1Version.secondaryKeywords}
      semanticKeywords: ${step1Version.semanticKeywords}
    `;
    await onGenerate({ message, step: 2 });
    setLoading(false);
  };

  return (
    <div className="step active">
      <div className="content">
        {versions && (
          <div className="large-text-area-container" style={{ position: 'relative' }}>
            <textarea className="large-text-area" value={versions[currentVersionIndex]?.response || ""} readOnly />
            {loading && <Spinner />}
            <div className="version-indicator">
              <span>Version</span>
              <div>
                <button onClick={() => onVersionChange('prev')} disabled={loading || currentVersionIndex === 0}>&lt;</button>
                <span>{currentVersionIndex + 1} / {versions.length}</span>
                <button onClick={() => onVersionChange('next')} disabled={loading || currentVersionIndex === versions.length - 1}>&gt;</button>
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
                {step1Responses.map((response, index) => (
                  <option key={index} value={index}>
                    Version {index + 1}
                  </option>
                ))}
              </select>
              <button onClick={handleStartClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Start</button>
              <button onClick={handleNextSectionClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Next Section</button>
            </div>
            <button onClick={handleGenerateFullArticleClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Full Article</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Step;
