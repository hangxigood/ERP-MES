'use client'

import React, { useState } from 'react';
import {
  DataSheetGrid,
  intColumn,
  textColumn,
  keyColumn,
} from 'react-datasheet-grid'

// Make sure to import the styles in your app
// import 'react-datasheet-grid/dist/style.css'

function VerificationCell({ rowData, setRowData }) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleClick = () => {
    if (!rowData.componentVerified) {
      setIsVerifying(true);
    }
  };

  const handleVerify = (password) => {
    // Replace this with your actual password verification logic
    if (password === 'correctpassword') {
      // Replace 'User Name' with the actual user's name
      setRowData({ ...rowData, componentVerified: 'User Name' });
    }
    setIsVerifying(false);
  };

  if (isVerifying) {
    return <PasswordPrompt onVerify={handleVerify} onCancel={() => setIsVerifying(false)} />;
  }

  return (
    <div onClick={handleClick}>
      {rowData.componentVerified || 'Click to verify'}
    </div>
  );
}

function PasswordPrompt({ onVerify, onCancel }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button type="submit">Verify</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default function Example() {
  const [data, setData] = useState([
    { part: '2288-PT-10', description: 'OM2 Mask', quantityRequired: 1},
    { part: '2288-PT-10', description: 'OM2 Mask', quantityRequired: 1},
    { part: '2312-PT-42', description: 'Oxy II EtCO2 Adult Subassembly SLM 15', quantityRequired: 1},
  ]);

  const columns = [
    { ...keyColumn('part', textColumn), title: 'Part', disabled: true },
    { ...keyColumn('description', textColumn), title: 'Description', disabled: true },
    { ...keyColumn('quantityRequired', intColumn), title: 'Quantity Required', disabled: true },
    { 
      ...keyColumn('componentVerified', textColumn),
      title: 'Component Verified to be Correct',
      component: VerificationCell,
    },
    { ...keyColumn('lotUsed', intColumn), title: 'Lot Used'},
    { ...keyColumn('lotQtyUsed', intColumn), title: 'Lot Qty. Used'},
    { ...keyColumn('scrapQty', intColumn), title: 'Scrap Qty. (must be identified by lot)'},
    { ...keyColumn('documentedBy', textColumn), title: 'Documented By:', 
      component: VerificationCell,},
  ];

  return (
    <DataSheetGrid
      value={data}
      onChange={setData}
      columns={columns}
      lockRows
      disableExpandSelection
    />
  );
}