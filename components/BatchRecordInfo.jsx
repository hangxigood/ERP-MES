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
  productImageSrc
}) {
  return (
    <section className="overflow-hidden self-stretch px-9 py-8 w-full bg-white rounded border-2 border-gray-500 border-solid max-md:px-5 max-md:max-w-full">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex flex-col w-[29%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col grow items-start text-base text-black max-md:mt-10">
            <h2 className="text-xl font-medium text-teal-300">OXY BATCH RECORD</h2>
            <div className="mt-2.5">Family: {family}</div>
            <div className="mt-1">Part Prefix: {partPrefix}</div>
            <div className="self-stretch mt-1">Part Number: {partNumber}</div>
            <div>Lot Number: {lotNumber}</div>
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[26%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col grow items-start mt-7 text-base text-black max-md:mt-10">
            <div className="self-stretch">Document Number: {documentNumber}</div>
            <div>Revision: {revision}</div>
            <div className="mt-1">Date: {date}</div>
            <div className="mt-1.5">Date of Manufacture: {dateOfManufacture}</div>
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[46%] max-md:ml-0 max-md:w-full">
          <div className="flex gap-10 self-stretch my-auto text-base text-black max-md:mt-10">
            <div>Description: {description}</div>
            <img
              loading="lazy"
              src={productImageSrc}
              alt="Product image"
              className="object-contain shrink-0 aspect-[1.18] w-[86px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BatchRecordInfo;