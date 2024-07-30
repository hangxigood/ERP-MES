import React from 'react';

const SectionItem = ({ icon, text, isActive }) => {
  const baseClasses = "flex gap-1.5 px-3 py-1 mt-1 rounded";
  const activeClasses = isActive ? "text-white bg-gray-500" : "bg-white";

  return (
    <div className={`${baseClasses} ${activeClasses}`}>
      <img loading="lazy" src={icon} alt="" className="shrink-0 my-auto w-2.5 aspect-[0.83]" />
      <div className="flex-1">{text}</div>
    </div>
  );
};

export default SectionItem;