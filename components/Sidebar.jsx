import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionItem from './SectionItem';
import option from "../public/images/option.svg";

const sectionItems = [
  { icon: option, text: "Header", href: "" },
  { icon: option, text: "Line Clearence", href: "line-clearence" },
  { icon: option, text: "Bill Of Materials", href: "bill-of-materials" },
  { icon: option, text: "Work Order Label Request & Accountability", href: "work-order-label-request-accountability" },
  { icon: option, text: "Reference Documents", href: "reference-documents" },
  { icon: option, text: "Training Verification", href: "training-verification" },
  { icon: option, text: "Assembly Record", href: "assembly-record" },
  { icon: option, text: "Critical Process Specifications Part I", href: "critical-process-specifications-part-i" },
  { icon: option, text: "Critical Process Specifications Part II", href: "critical-process-specifications-part-ii" },
  { icon: option, text: "Critical Process Specifications Part III", href: "critical-process-specifications-part-iii" },
  { icon: option, text: "Printer Job Resend", href: "printer-job-resend" },
  { icon: option, text: "100% Manual Elbow In-Line Inspection", href: "100-manual-elbow-in-line-inspection" },
  { icon: option, text: "200% Insert & Post Alignment Visual Inspection", href: "200-insert-post-alignment-visual-inspection" },
  { icon: option, text: "First Off Inspection", href: "first-off-inspection" },
  { icon: option, text: "Completed Skid Inspection", href: "completed-skid-inspection" },
  { icon: option, text: "Last Off Inspection", href: "last-off-inspection" },
  { icon: option, text: "Final Inspection & Release", href: "final-inspection-release" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const batchId = pathSegments[1] || '';

  const updatedSectionItems = sectionItems.map(item => {
    const fullHref = item.href 
      ? `/batch-record/${batchId}/${item.href}`
      : `/batch-record/${batchId}`;
    return {
      ...item,
      href: fullHref === pathname ? "#" : fullHref,
      isActive: fullHref === pathname
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
          <div className="mt-1 text-sm text-teal-300">QA Inspection</div>
          {updatedSectionItems.slice(-4).map((item, index) => (
            <Link key={index + updatedSectionItems.length} href={item.href} passHref>
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