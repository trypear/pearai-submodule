import { Button } from '@/components/ui/button';
import { getMetaKeyLabel } from '@/util';
import React, { useState } from 'react';
import styled from 'styled-components';

interface OnboardingTutorialProps {
  onClose: () => void;
}

const TutorialCardDiv = styled.div`
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  margin: 1rem;
  min-height: 20rem;
  position: relative;
`;

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: <h3>Select Code and Chat (<kbd>{getMetaKeyLabel()}</kbd>+<kbd>L</kbd>)</h3>,
      description: <p>Select a portion of code, press <kbd>{getMetaKeyLabel()}</kbd>+<kbd>L</kbd> to bring it to the chat, and ask "<em>what is this?</em>"</p>,
    },
    {
      title: <h3>Inline Code Editing (<kbd>{getMetaKeyLabel()}</kbd>+<kbd>I</kbd>)</h3>,
      description: <p>Select a function block, press <kbd>{getMetaKeyLabel()}</kbd>+<kbd>I</kbd>, and ask it "<em>put print statements</em>. <br/><br/>After it loads, press <kbd>{getMetaKeyLabel()}+SHIFT+ENTER</kbd> to accept all, or <kbd>{getMetaKeyLabel()}+SHIFT+DEL</kbd> to reject all changes.</p>,
    },
    {
      title: <h3>Codebase Context (<kbd>{getMetaKeyLabel()}</kbd>+<kbd>ENTER</kbd>)</h3>,
      description: <p>Ask "<em>what does my codebase do</em>" and press <kbd>{getMetaKeyLabel()}</kbd>+<kbd>ENTER</kbd>.<br/><br/> Note: codebase indexing must finish before you can run this.</p>,
    },
    {
      title: <h3>Toggle PearAI Inventory</h3>,
      description: <p>Press <kbd>{getMetaKeyLabel()}</kbd>+<kbd>E</kbd> to toggle PearAI inventory, try out <strong>Creator</strong> and <strong>Search</strong> directly in there!</p>,
    },
  ];

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  return (
    <TutorialCardDiv className="p-2">
      <div
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white rounded-full cursor-pointer shadow-sm"
        role="button"
        aria-label="Close"
      >
        X
      </div>
      <div className="webm-placeholder" style={{ height: '12rem', backgroundColor: '#f0f0f0', marginBottom: '1rem' }}>
        {/* Placeholder for webm image */}
      </div>
      <div className="flex flex-col justify-between min-h-36">
        <div>
          {pages[currentPage].title}
          {pages[currentPage].description}
        </div>
        <div className="flex justify-center gap-2">
          <Button size="sm" onClick={prevPage} disabled={currentPage === 0}>Previous</Button>
          <Button size="sm" className="w-16" onClick={nextPage} disabled={currentPage === pages.length - 1}>Next</Button>
        </div>
      </div>
    </TutorialCardDiv>
  );
};

export default OnboardingTutorial;
