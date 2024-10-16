"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionItem from './SectionItem';

const Sidebar = ({ availableSections = [] }) => {
  const pathname = usePathname();
  const decodedPathname = decodeURIComponent(pathname);
  const pathSegments = decodedPathname.split('/').filter(Boolean);
  const templateName = pathSegments[0] || '';
  const batchRecordId = pathSegments[1] || '';

<<<<<<< Updated upstream
  const updatedSectionItems = availableSections.map(section => {
    const fullHref = `/${templateName}/${batchRecordId}/${section.name}`;
    const decodedFullHref = decodeURIComponent(fullHref);
    return {
      text: section.displayName,
      href: fullHref,
      isActive: decodedFullHref === decodedPathname
    };
  });
=======
  const updatedSectionItems = availableSections.map(section => ({
    text: section.displayName,
    href: `/${templateName}/${batchRecordId}/${section.name}`,
    isActive: `/${templateName}/${batchRecordId}/${section.name}` === decodedPathname
  }));
>>>>>>> Stashed changes

  return (
    <nav className="flex-shrink-0 w-64 bg-gray-100 border-r border-gray-200">
      <div className="flex flex-col h-full p-4">
        <div className="text-lg font-bold text-teal-300 mb-4">Sections</div>
        {updatedSectionItems.length > 0 ? (
          updatedSectionItems.map((item, index) => (
            <Link key={index} href={item.href} passHref>
              <SectionItem {...item} />
            </Link>
          ))
        ) : (
          <div>No sections available</div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
