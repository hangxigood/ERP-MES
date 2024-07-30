import React from 'react';
import SectionItem from './SectionItem';

const uncompletedURL = "https://cdn.builder.io/api/v1/image/assets/TEMP/e9b381f042a91c8889d48aeb32ad2e97ecc1bf701bd5f56d14cdbd5d8b241d17?apiKey=2b08548dcb384abfa0a328fedffac42b&&apiKey=2b08548dcb384abfa0a328fedffac42b";
const completedURL = "https://cdn.builder.io/api/v1/image/assets/TEMP/9ce13765e13f02b307874763224f836207d3d2fad19d28d1479aa67ab0ecc628?apiKey=2b08548dcb384abfa0a328fedffac42b&&apiKey=2b08548dcb384abfa0a328fedffac42b";
const completingURL = "https://cdn.builder.io/api/v1/image/assets/TEMP/50eb1c25f4d184bb83c29939310104f694825bd8170392b9bd970fdf8f851648?apiKey=2b08548dcb384abfa0a328fedffac42b&&apiKey=2b08548dcb384abfa0a328fedffac42b";

const sectionItems = [
  { icon: completingURL, text: "Header", isActive: true },
  { icon: uncompletedURL, text: "Line Clearence" },
  { icon: uncompletedURL, text: "Bill Of Materials" },
  { icon: uncompletedURL, text: "Work Order Label Request & Accountability" },
  { icon: uncompletedURL, text: "Reference Documents" },
  { icon: uncompletedURL, text: "Training Verification" },
  { icon: uncompletedURL, text: "Assembly Record" },
  { icon: uncompletedURL, text: "Critical Process Specifications Part I" },
  { icon: uncompletedURL, text: "Critical Process Specifications Part II" },
  { icon: uncompletedURL, text: "Critical Process Specifications Part III" },
  { icon: uncompletedURL, text: "Printer Job Resend" },
  { icon: uncompletedURL, text: "100% Manual Elbow In-Line Inspection" },
  { icon: uncompletedURL, text: "200% Insert & Post Alignment Visual Inspection" },
  { icon: uncompletedURL, text: "First Off Inspection" },
  { icon: uncompletedURL, text: "Completed Skid Inspection" },
  { icon: uncompletedURL, text: "Last Off Inspection" },
  { icon: uncompletedURL, text: "Final Inspection & Release" },
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