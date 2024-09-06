'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

const templateData = [
    {section: "Header", name: "Part", order: 1, height: 2, row_span: 2, col_span: 1, col: 1},
    {section: "Header", name: "Description", order: 2, height: 2, row_span: 2, col_span: 1, col: 2},
    {section: "Header", name: "Quantity Required", order: 3, height: 2, row_span: 2, col_span: 1, col: 3},
    {section: "Header", name: "Component Verified to be Correct", order: 4, height: 1, row_span: 1, col_span: 2, col: 4},
    {section: "Header", name: "Sign", order: 5, height: 1, row_span: 1, col_span: 1, row: 2, col: 4},
    {section: "Header", name: "Date", order: 6, height: 1, row_span: 1, col_span: 1, row: 2, col: 5},
    {section: "Header", name: "Lot Used", order: 7, height: 2, row_span: 2, col_span: 1, col: 6},
    {section: "Header", name: "Lot Qty.", order: 8, height: 2, row_span: 2, col_span: 1, col: 7},
    {section: "Header", name: "Scrap Qty.", order: 9, height: 2, row_span: 2, col_span: 1, col: 8},
    {section: "Header", name: "Documented By:", order: 10, height: 2, row_span: 2, col_span: 1, col: 9},
    {section: "Header", name: "Date:", order: 11, height: 2, row_span: 2, col_span: 1, col: 10},
    {section: "Data", field_name: "part", field_type: "text", required: true, order: 1, height: 1, row_span: 1, col_span: 1, col: 1},
    {section: "Data", field_name: "description", field_type: "text", required: true, order: 2, height: 1, row_span: 1, col_span: 1, col: 2,},
    {section: "Data", field_name: "quantity", field_type: "number", required: true, order: 3, height: 1, row_span: 1, col_span: 1, col: 3},
    {section: "Data", field_name: "verified", field_type: "checkbox", required: true, order: 4, height: 1, row_span: 1, col_span: 1, col: 4},
    {section: "Data", field_name: "sign", field_type: "text", required: true, order: 5, height: 1, row_span: 1, col_span: 1, col: 5},
    {section: "Data", field_name: "lotUsed", field_type: "text", required: true, order: 6, height: 1, row_span: 1, col_span: 1, col: 6},
    {section: "Data", field_name: "lotQuantity", field_type: "number", required: true, order: 7, height: 1, row_span: 1, col_span: 1, col: 7},
    {section: "Data", field_name: "scrapQuantity", field_type: "number", required: false, order: 8, height: 1, row_span: 1, col_span: 1, col: 8},
    {section: "Data", field_name: "documentedBy", field_type: "text", required: true, order: 9, height: 1, row_span: 1, col_span: 1, col: 9},
    {section: "Data", field_name: "date", field_type: "date", required: true, order: 10, height: 1, row_span: 1, col_span: 1, col: 10}
  ];

const ExcelCell = ({ cell, isHeader }) => {
  const style = {
    gridColumn: cell.col ? `${cell.col} / span ${cell.col_span}` : `span ${cell.col_span}`,
    gridRow: cell.row ? `${cell.row} / span ${cell.row_span}` : `span ${cell.row_span}`,
    height: `${cell.height * 50}px`, // Assuming 30px as base height
  };

  const content = isHeader ? cell.name : '';

  return (
    <div className={`${styles.cell} ${isHeader ? styles.headerCell : ''}`} style={style}>
      {content}
      {!isHeader && (
        <input 
          type={cell.field_type} 
          required={cell.required}
          className={styles.input}
        />
      )}
    </div>
  );
};

export default function ExcelPreview() {
  const [headerCells, setHeaderCells] = useState([]);
  const [dataCells, setDataCells] = useState([]);

  useEffect(() => {
    const headers = templateData.filter(cell => cell.section === 'Header');
    const data = templateData.filter(cell => cell.section === 'Data');
    setHeaderCells(headers);
    setDataCells(data);
  }, []);

  return (
    <div className={styles.excelSheet}>
      <div className={styles.headerRow}>
        {headerCells.map((cell, order) => (
          <ExcelCell key={order} cell={cell} isHeader={true} />
        ))}
      </div>
      <div className={styles.dataRow}>
        {dataCells.map((cell, order) => (
          <ExcelCell key={order} cell={cell} isHeader={false} />
        ))}
      </div>
    </div>
  );
}