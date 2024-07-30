import React from 'react';
import Header from '../_components/Header';
import Sidebar from '../_components/Sidebar';
import MainContent from '../_components/MainContent';

const BatchRecordSystem = () => {
  return (
    <div className="flex flex-col bg-white">
      <Header />
      <div className="self-center w-full">
        <div className="flex gap-6">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default BatchRecordSystem;