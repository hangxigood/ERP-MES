import React from 'react';
import Image from 'next/image';

const SectionItem = ({ icon, text, isActive }) => {
  const baseClasses = "flex gap-1.5 px-3 py-1 mt-1 rounded";
  const activeClasses = isActive ? "text-white bg-gray-500" : "bg-white";

  return (
    <div className={`${baseClasses} ${activeClasses}`}>
      <Image
        src={icon}
        alt="Option icon"
        width={11}
        height={12}
      />
      <div className="flex-1">{text}</div>
    </div>
  );
};

export default SectionItem;