/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('SMIDB');

// Create a new document in the collection.
db.getCollection('templates').insertOne({
  _id: ObjectId('66ea36c6966098b64c0f95d9'),
  name: 'Oxy ETCO2(2.0) - SMI2 - OM-2125-14SLM',
  version: 1,
  structure: [
    {
      order: 1,
      sectionName: 'Header',
      sectionDescription: 'Production shall comply with WI0002C\nAcceptable Practices for Controlled Manufacturing Room',
      fields: [
        {
          name: 'Name',
          'default': 'OXY BATCH RECORD',
          fieldType: 'text'
        },
        {
          name: 'Document Number',
          'default': 'DO1862',
          fieldType: 'text'
        },
        {
          name: 'Revision',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'Date',
          'default': '',
          fieldType: 'date'
        },
        {
          name: 'Family',
          'default': 'Oxy ETCO2(2.0)',
          fieldType: 'text'
        },
        {
          name: 'Part Prefix',
          'default': 'SMI2/',
          fieldType: 'text'
        },
        {
          name: 'Part Number',
          'default': 'OM-2125-14SLM',
          fieldType: 'text'
        },
        {
          name: 'Description',
          'default': 'OxyMask II Adult EtCO2 14\', SLM 15\'',
          fieldType: 'text'
        },
        {
          name: 'Lot Number',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'Date of Manufacture',
          'default': '',
          fieldType: 'date'
        }
      ]
    },
    {
      order: 2,
      sectionName: 'Line Clearence',
      sectionDescription: 'Perform thorough line clearance prior to beginning of assembly of units, and document below:',
      fields: [
        {
          name: 'The production line has been cleared of any/all parts or components not specified in the BOM',
          'default': '',
          fieldType: 'checkbox'
        },
        {
          name: 'There is only a SINGLE lot of any component present on the line',
          'default': '',
          fieldType: 'checkbox'
        },
        {
          name: 'All working surfaces and equipment have been wiped down with 70% isopropyl alcohol and wipes. Daily operator duties will continue as per WI0002C',
          'default': '',
          fieldType: 'checkbox'
        }
      ]
    },
    {
      order: 3,
      sectionName: 'Bill of Materials',
      sectionDescription: 'BOM/LT detail must be documented in real time with production.\nCOMPONENTS COLUMN TO BE COMPLETED PRIOR TO PRODUCTION START',
      fields: [
        {
          name: 'Part',
          'default': [
            '2288-PT-10',
            '2312-PT-42',
            '2288-PT-02',
            '2326-PT-02',
            '2312-PT-01',
            '040917-1-1',
            '2299-PT-01',
            '000330-1-33',
            '000330-1-9',
            '2129-PG-02',
            '92121801-9',
            'DB1080WF-1',
            'DBTTBK4UV',
            'PW9015PP800',
            'RAWCY4710',
            'L03112',
            'L03111',
            'IFU0299',
            '-',
            '-',
            '-',
            '-'
          ],
          fieldType: 'text'
        },
        {
          name: 'Description',
          'default': [
            'OM2 Mask',
            'Oxy II EtCO2 Adult Subassembly SLM 15\'',
            'Adult Diffuser Sleeve',
            'PolyPro Adult Diffuser Sleeve',
            'EtCO2 Insert',
            'Elastic Strap – 21”',
            'SMI Elastic Strap – 21”',
            'Oxygen Supply Tubing – (1500 M/ROLL) Coil ',
            'Universal Oxygen Connector',
            'OM Support Shell',
            'Capnoxygen Shipper',
            '8 X 10 Stock Bag, Clear/White',
            '4" Printer Ribbon - Black',
            'Banding Film White',
            'Cyclohexanone',
            'Tubing Label 2" x 4"',
            'Shipper Label',
            'Instructions For Use - white',
            'Total Units Assembled:(Max: 25,200)',
            'Total Skids Built:(Max: 16 Skids)'
          ],
          fieldType: 'text'
        },
        {
          name: 'Quantity',
          'default': [
            '1',
            '1',
            '1',
            '1',
            '1',
            '1',
            '1',
            '14FT',
            '1',
            '1',
            'HOLDS 25 UNITS',
            '1',
            '-',
            '9CM',
            '-',
            '1',
            '1 PER CASE OF 25 UNITS',
            '1 PER CASE OF 25 UNITS',
            '',
            '',
            '-',
            '-'
          ],
          fieldType: 'text'
        },
        {
          name: 'Sign',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'text'
        },
        {
          name: 'Date1',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'date'
        },
        {
          name: 'Lot Used',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'text'
        },
        {
          name: 'Lot Qty. Used',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'int'
        },
        {
          name: 'Scrap Qty.(must be identified by lot)',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'int'
        },
        {
          name: 'Documented By:',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'text'
        },
        {
          name: 'Date2',
          'default': [
            '',
            '',
            '',
            ''
          ],
          fieldType: 'date'
        }
      ]
    },
    {
      order: 4,
      sectionName: 'Work Order Label Request',
      sectionDescription: 'Performed by Production & QA\nLabel Request & Accountability is for the entire work order\nTo be completed at time of Last Off submission to QA\nLabels and IFUs are to be kit packed and to be verified and balanced out at the end of each skid completion and is to be verified by QA on Completed Skid Inspection sheets.',
      fields: [
        {
          name: 'LABEL NUMBER',
          'default': [
            'L03111 Carton Label 1 per case of 25 units (63 cases per skid)',
            'IFU - white IFU02991 per case of 25 units'
          ],
          fieldType: 'text'
        },
        {
          name: 'QTY.REQUESTED',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'REQUESTEDBY / DATE',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QTY. PRINTED',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'PRINTED BY / DATE',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QA  VERIFICATION / DATE',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QTY.TO Q.A.',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'QTY. ISSUED TO PROD’N (A)',
          'default': '',
          fieldType: 'int'
        },
        {
          name: ' COUNT VERIFIED BY / DATE',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QTY. USED (B)',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'QTY. UNUSED (C)',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'TOTAL (B + C) = (D)',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'BALANCE (A – D) INITIAL & DATE',
          'default': '',
          fieldType: 'int'
        }
      ]
    },
    {
      order: 5,
      sectionName: 'Responsibilities & Reference Documents',
      sectionDescription: 'Production /Setup personnel to complete line clearance\nLead Hands are to verify that all Production Associates have been trained on all applicable QPS \nProduction to provide first off/in-process/last off samples to Quality. \nQuality responsible for conducting first off, in-process, last off, final inspections, product release and documentation review.',
      fields: [
        {
          name: 'Document Type',
          'default': [
            'Quality Equipment Standardization (QES)',
            'Quality Equipment Standardization (QES)',
            'Quality Equipment Standardization (QES)',
            'Quality Equipment Standardization (QES)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Quality Process Standardization (QPS)',
            'Document (DO)',
            'Document (DO)'
          ],
          fieldType: 'text'
        },
        {
          name: 'Document Number',
          'default': [
            'QES143',
            'QES144',
            'QES041',
            'QES044',
            'QES193',
            'QPS911',
            'QPS926',
            'QPS878',
            'QPS794',
            'QPS302',
            'QPS136',
            'QPS668',
            'DO741',
            'DO774'
          ],
          fieldType: 'text'
        },
        {
          name: 'Document Title',
          'default': [
            'SnapFit Automation Cell',
            'SnapCell Device Conversion',
            'PS 125 OneStep Table Top Bagger',
            'Sending Print Job to Autobagger',
            'OxyPro Mini-cell set up',
            'Oxy2 Mini-cell',
            'SnapCell Station 1 for Oxy2',
            'Manual Elastic Installation and Label Application',
            'Support Shell and Bagging',
            'Autobagger',
            'Final Packaging',
            'QA Air Flow Test',
            'Packaging Record',
            'OXY Chart for QPS'
          ],
          fieldType: 'text'
        }
      ]
    },
    {
      order: 6,
      sectionName: 'Training Verification',
      sectionDescription: 'Performed by Lead Hand \n Lead Hands are to verify that all Production Associates involved in the build have been trained on applicable QPS and working instructions. Record the revision of each QPS used in the build below and sign/date below. \n Submit to QA with First Off. \n Note: Production Associate training is captured on applicable QPS documents.',
      fields: [
        {
          name: 'Doc#',
          'default': [
            'QPS911',
            'QPS926',
            'QPS878',
            'QPS794',
            'QPS302',
            'QPS136'
          ],
          fieldType: 'text'
        },
        {
          name: 'Description',
          'default': [
            'Oxy2 Mini-cell',
            'SnapCell Station 1 for Oxy2',
            'Manual Elastic Installation and Label Application',
            'Support Shell and Bagging',
            'Autobagger',
            'Final Packaging'
          ],
          fieldType: 'text'
        },
        {
          name: 'Revision Used',
          'default': '',
          fieldType: 'int'
        },
        {
          name: 'Sign',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'Date',
          'default': '',
          fieldType: 'date'
        }
      ]
    },
    {
      order: 7,
      sectionName: 'Assembly Record',
      sectionDescription: 'Frequency: At Start of every shift.',
      fields: [
        {
          name: 'QPS911:',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QPS926:',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QPS878:',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QPS794:',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QP302:',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'QPS136:',
          'default': '',
          fieldType: 'text'
        }
      ]
    },
    {
      order: 8,
      sectionName: 'Critical Process Specifications Part I',
      sectionDescription: 'Frequency: At Start Up, Start of Shift, after 8 hours of down time, at process interruption and/or correction.',
      fields: [
        {
          name: 'Settings:',
          'default': [
            '---OXY2 MINI-CELL---',
            'HMI Profile',
            'Regulator Pressure',
            '---SNAPCELL---',
            'HMI Profile',
            'Main Inlet Pressure',
            'Elastic Vision System',
            'Station 6',
            'Station 1 & 2 Nest Pins',
            '---ATEQ FLOW METER---',
            'Regulator Pressure',
            'Program',
            '---BOWL FEEDER---',
            'Inline Speed',
            'Speed',
            'Hopper Speed',
            '---SOLVENT DISPENSERS---',
            'Solvent dispense cylinders-',
            'Solvent Pot Pressure',
            'Elbow Dispenser Dial Setting',
            'Connector Dispenser Dial Setting',
            '---BANDER---',
            'Inlet Pressure',
            'Soft tension',
            '---LABEL MILL---',
            'Inlet Pressure'
          ],
          fieldType: 'text'
        },
        {
          name: 'Specification',
          'default': [
            '---OXY2 MINI-CELL---',
            'OM-Oxy2 ETCO2 MASK',
            '85 PSI [80-90 PSI]',
            '---SNAPCELL---',
            'SMI2/OM-2125-14SLM',
            '95 PSI [85 – 105 PSI]',
            'OFF',
            'LONG Pin installed',
            'REMOVED',
            '---ATEQ FLOW METER---',
            '75 PSI [70-80 PSI]',
            'Pr 005',
            '---BOWL FEEDER---',
            '70% [REF]',
            '56% [REF]',
            '40% [REF]',
            '---SOLVENT DISPENSERS---',
            '-cylinders have been wiped down-',
            '8.5 PSI [7.5 – 9.5 PSI]',
            '11 Increments [10 – 12] *See Notes',
            '9 Increments [8 – 10] *See Notes',
            '---BANDER---',
            '60 PSI [50 – 70 PSI]',
            '40% [REF]',
            '---LABEL MILL---',
            '75 PSI [65 – 85 PSI]'
          ],
          fieldType: 'text'
        },
        {
          name: 'Set Up Reading',
          'default': [
            '---OXY2 MINI-CELL---',
            '',
            '',
            '---SNAPCELL---',
            '',
            '',
            '',
            '',
            '',
            '---ATEQ FLOW METER---',
            '',
            '',
            '---BOWL FEEDER---',
            '',
            '',
            '',
            '---SOLVENT DISPENSERS---',
            '-before starting as per QES143-',
            '',
            '',
            '',
            '---BANDER---',
            '',
            '',
            '---LABEL MILL---',
            ''
          ],
          fieldType: 'text'
        },
        {
          name: 'Status',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'Sign/Date',
          'default': '',
          fieldType: 'text'
        }
      ]
    },
    {
      order: 9,
      sectionName: 'Critical Process Specifications Part II',
      sectionDescription: 'Frequency: At Start Up and At Start of Shift',
      fields: [
        {
          name: 'Process',
          'default': [
            'Print Heat Settings',
            'Heat Range (Seal Heat)'
          ],
          fieldType: 'text'
        },
        {
          name: 'Specification',
          'default': [
            '15 ± 2 (13 to 17)',
            '40% ± 5% (35% to 45%)'
          ],
          fieldType: 'text'
        },
        {
          name: 'Set Up Reading',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'Status',
          'default': '',
          fieldType: 'text'
        },
        {
          name: 'Sign',
          'default': '',
          fieldType: 'text'
        }
      ]
    }
  ],
  createdBy: '66e5c2d79dc57b997b35a298',
  updatedBy: '66e5c2d79dc57b997b35a298'
});
