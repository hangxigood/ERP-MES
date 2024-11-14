"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionItem from './SectionItem';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { SharedContext } from '../contexts/BatchRecordContext';

// SafeLink component
const SafeLink = ({ href, children, routerPush, ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    routerPush(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

const Sidebar = ({ availableSections = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const decodedPathname = decodeURIComponent(pathname);
  const pathSegments = decodedPathname.split('/').filter(Boolean);
  const templateName = pathSegments[0] || '';
  const batchRecordId = pathSegments[1] || '';
  const { hasUnsavedChanges, refreshTrigger, setRefreshTrigger } = useContext(SharedContext);
  const { routerPush } = useUnsavedChanges(hasUnsavedChanges);

  const updatedSectionItems = availableSections.map(section => ({
    text: section.displayName,
    href: `/${templateName}/${batchRecordId}/${section.name}`,
    isActive: `/${templateName}/${batchRecordId}/${section.name}` === decodedPathname,
    isSigned: section.isSigned,
    duplicatable: section.duplicatable,
    isDuplicate: section.isDuplicate
  }));

  console.log(updatedSectionItems);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth >= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDeleteDuplicate = async (sectionName) => {
    try {
      // Check if we're deleting the current section
      const currentSection = decodeURIComponent(pathSegments[2] || '');
      const isCurrentSection = currentSection === sectionName;
      
      // If deleting current section, navigate to parent first
      if (isCurrentSection) {
        await routerPush(`/${templateName}/${batchRecordId}`);
      }

      const response = await fetch(`/api/${templateName}/${batchRecordId}/sections/${sectionName}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete section');
      }
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleDuplicate = async (sectionName) => {
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/sections/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          batchRecordId,
          sectionName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate section');
      }
      
      // Refresh the sections list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error duplicating section:', error);
    }
  };

  return (
    <nav className={`transition-all duration-300 flex-shrink-0 bg-gray-100 border-r border-gray-200 ${isExpanded ? 'md:w-64' : 'w-16'}`}>
      <div className={`flex flex-col h-full ${isExpanded ? 'p-4' : 'p-2'}`}>
        <div className="flex justify-start mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-teal-300 text-white rounded hover:bg-teal-400 transition-colors w-12 h-12 flex items-center justify-center"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {isExpanded && (
          <>
            <div className="text-lg font-bold text-teal-300 mb-4">Sections</div>
            {updatedSectionItems.length > 0 ? (
              updatedSectionItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <SafeLink 
                    href={item.href}
                    routerPush={routerPush}
                    className="flex-grow"
                  >
                    <SectionItem {...item} />
                  </SafeLink>
                  {item.duplicatable && !item.isDuplicate && (
                    <button
                      className="ml-2 w-6 h-6 flex items-center justify-center text-teal-500"
                      onClick={() => handleDuplicate(item.text)}
                    >
                      +
                    </button>
                  )}
                  {item.isDuplicate && (
                    <button
                      className="ml-2 w-6 h-6 flex items-center justify-center text-teal-500"
                      onClick={() => handleDeleteDuplicate(item.text)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div>No sections available</div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
