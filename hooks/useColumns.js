/**
 * @fileoverview Hook for generating DataSheetGrid column configurations based on field types.
 * Handles different field types and their respective column settings.
 * 
 * @module hooks/useColumns
 */

import { useMemo } from 'react';
import { keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';

/**
 * Calculate column width based on field type and value length
 * 
 * @param {*} field - Field definition object
 * @returns {number} Column width based on field type and value length
 */
const calculateColumnWidth = (field) => {
  // Get all values including field name
  const allValues = [
    field.fieldName,
    ...(Array.isArray(field.fieldValue) ? field.fieldValue : [field.fieldValue])
  ].filter(Boolean);

  // Calculate max length considering all values
  const maxLength = Math.max(
    ...allValues.map(value => String(value).length)
  );

  // Base width per character (adjust these values as needed)
  const charWidth = {
    default: 12,  // Default width per character
    date: 10,    // Date fields need more space
    checkbox: 6  // Checkbox fields can be narrower
  };

  // Minimum widths by field type
  const minWidth = {
    date: 140,
    checkbox: 80,
    default: 100
  };

  // Calculate width based on field type
  const width = Math.max(
    minWidth[field.fieldType] || minWidth.default,
    maxLength * (charWidth[field.fieldType] || charWidth.default)
  );

  return width;
};

/**
 * Custom hook for generating grid columns based on field configurations
 * 
 * @param {Array} fields - Array of field definitions
 * @param {boolean} isSignedOff - Whether the form is signed off
 * @returns {Array} Array of column configurations for DataSheetGrid
 */
export const useColumns = (fields, isSignedOff) => {
  return useMemo(() => {
    if (!fields) return [];
    
    return fields.map(field => {
      let columnType;
      switch (field.fieldType) {
        case 'float':
          columnType = floatColumn;
          break;
        case 'date':
          columnType = {
            ...dateColumn,
            parseDate: (value) => value ? new Date(value) : null,
            formatDate: (date) => date ? date.toISOString().split('T')[0] : '',
          };
          break;
        case 'checkbox':
          columnType = checkboxColumn;
          break;
        case 'int':
          columnType = intColumn;
          break;
        default:
          columnType = textColumn;
      }

      return {
        ...keyColumn(field.fieldName, columnType),
        title: field.fieldName,
        minWidth: calculateColumnWidth(field),
        disabled: isSignedOff,
      };
    });
  }, [fields, isSignedOff]);
};