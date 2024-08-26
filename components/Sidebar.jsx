import React from 'react';
import SectionItem from './SectionItem';
import option from "../public/images/option.svg";

const sectionItems = [
  { icon: option, text: "Header", isActive: true },
  { icon: option, text: "Line Clearence" },
  { icon: option, text: "Bill Of Materials" },
  { icon: option, text: "Work Order Label Request & Accountability" },
  { icon: option, text: "Reference Documents" },
  { icon: option, text: "Training Verification" },
  { icon: option, text: "Assembly Record" },
  { icon: option, text: "Critical Process Specifications Part I" },
  { icon: option, text: "Critical Process Specifications Part II" },
  { icon: option, text: "Critical Process Specifications Part III" },
  { icon: option, text: "Printer Job Resend" },
  { icon: option, text: "100% Manual Elbow In-Line Inspection" },
  { icon: option, text: "200% Insert & Post Alignment Visual Inspection" },
  { icon: option, text: "First Off Inspection" },
  { icon: option, text: "Completed Skid Inspection" },
  { icon: option, text: "Last Off Inspection" },
  { icon: option, text: "Final Inspection & Release" },
];

const Sidebar = () => {
  return (
    <nav className="flex flex-col w-[21%] max-md:ml-0 max-md:w-full">
      <div className="flex grow gap-2.5 text-base text-black max-md:mt-10">
        <div className="flex flex-col self-start px-5 mt-9">
          <div className="text-lg font-bold text-teal-300">Sections</div>
          {sectionItems.map((item, index) => (
            <SectionItem key={index} {...item} />
          ))}
          <div className="mt-1 text-sm text-teal-300">QA Inspection</div>
          {sectionItems.slice(-4).map((item, index) => (
            <SectionItem key={index + sectionItems.length} {...item} />
          ))}
        </div>
        <div className="shrink-0 w-px border border-solid border-stone-900 h-[882px]" />
      </div>
    </nav>
  );
};

export default Sidebar;