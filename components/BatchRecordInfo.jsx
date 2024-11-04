import React from 'react';

function BatchRecordInfo({
  family,
  partPrefix,
  partNumber,
  lotNumber,
  documentNumber,
  revision,
  date,
  dateOfManufacture,
  description,
}) {
  return (
    <section className="mb-6 bg-white rounded-lg border border-gray-300">
      <h2 className="text-xl font-medium text-teal-500 p-4 pb-2">OXY BATCH RECORD</h2>
      <div className="grid grid-cols-3 gap-8 p-4 pt-0">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-32">Family:</span>
            <span>{family}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Part Prefix:</span>
            <span>{partPrefix}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Part Number:</span>
            <span>{partNumber}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Lot Number:</span>
            <span>{lotNumber}</span>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-32">Document Number:</span>
            <span>{documentNumber}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Revision:</span>
            <span>{revision}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Date of Manufacture:</span>
            <span>{dateOfManufacture}</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-32">Description:</span>
            <span>{description}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BatchRecordInfo;