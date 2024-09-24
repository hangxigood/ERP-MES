import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionItem from './SectionItem';

const Sidebar = ({ availableSections }) => {
  const pathname = usePathname();
  const decodedPathname = decodeURIComponent(pathname);
  const pathSegments = decodedPathname.split('/').filter(Boolean);
  const templateName = pathSegments[0] || '';
  const batchRecordId = pathSegments[1] || '';

  const updatedSectionItems = availableSections.map(section => {
    const fullHref = `/${templateName}/${batchRecordId}/${section.name}`;
    const decodedFullHref = decodeURIComponent(fullHref);
    return {
      text: section.displayName,
      href: fullHref,
      isActive: decodedFullHref === decodedPathname
    };
  });

  return (
    <nav className="flex flex-col w-[21%] max-md:ml-0 max-md:w-full">
      <div className="flex grow gap-2.5 text-base text-black max-md:mt-10">
        <div className="flex flex-col self-start px-5 mt-9">
          <div className="text-lg font-bold text-teal-300">Sections</div>
          {updatedSectionItems.map((item, index) => (
            <Link key={index} href={item.href} passHref>
              <SectionItem {...item} />
            </Link>
          ))}
        </div>
        <div className="shrink-0 w-px border border-solid border-stone-900 h-[882px]" />
      </div>
    </nav>
  );
};

export default Sidebar;