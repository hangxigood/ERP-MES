'use client'

import React, { useState } from 'react';
import {
  DataSheetGrid,
  intColumn,
  textColumn,
  keyColumn,
} from 'react-datasheet-grid'
import { useSession } from 'next-auth/react'

// Make sure to import the styles in your app
// import 'react-datasheet-grid/dist/style.css'

function VerificationCell({ rowData, setRowData }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const { data: session } = useSession();

  const handleClick = () => {
    if (!rowData.componentVerified) {
      setIsVerifying(true);
    }
  };

  const handleVerify = async (password) => {
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const userName = session?.user?.name || 'Verified User';
        setRowData({ ...rowData, componentVerified: userName });
      } else {
        // Handle incorrect password
        alert('Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      alert('An error occurred while verifying the password.');
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
    { part: '2288-PT-10', description: 'OM2 Mask', quantityRequired: 1, componentVerified: null },
    { part: '2288-PT-10', description: 'OM2 Mask', quantityRequired: 1, componentVerified: null },
    { part: '2312-PT-42', description: 'Oxy II EtCO2 Adult Subassembly SLM 15', quantityRequired: 1, componentVerified: null },
  ]);

  const disableSignedRow = ({ rowData }) => rowData.componentVerified !== null;

  const columns = [
    { ...keyColumn('part', textColumn), title: 'Part', disabled: disableSignedRow },
    { ...keyColumn('description', textColumn), title: 'Description', disabled: disableSignedRow },
    { ...keyColumn('quantityRequired', intColumn), title: 'Quantity Required', disabled: disableSignedRow },
    { ...keyColumn('lotUsed', intColumn), title: 'Lot Used', disabled: disableSignedRow },
    { ...keyColumn('lotQtyUsed', intColumn), title: 'Lot Qty. Used', disabled: disableSignedRow },
    { ...keyColumn('scrapQty', intColumn), title: 'Scrap Qty. (must be identified by lot)', disabled: disableSignedRow },
    { 
      ...keyColumn('documentedBy', textColumn), 
      title: 'Documented By:', 
      component: VerificationCell,
      // The verification cell should always be enabled
      disabled: false
    },
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
