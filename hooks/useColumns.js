/**
 * @fileoverview Hook for generating DataSheetGrid column configurations based on field types.
 * Handles different field types and their respective column settings.
 * 
 * @module hooks/useColumns
 */

import { useMemo } from 'react';
import { keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';

/**
 * Custom hook for generating grid columns based on field configurations
 * 
 * @param {Array} fields - Array of field definitions
 * @param {Object} maxLengths - Object containing maximum lengths for each field
 * @param {boolean} isSignedOff - Whether the form is signed off
 * @returns {Array} Array of column configurations for DataSheetGrid
 */
export const useColumns = (fields, maxLengths, isSignedOff) => {
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
        minWidth: Math.max(100, maxLengths[field.fieldName] * 13),
        disabled: isSignedOff,
      };
    });
  }, [fields, maxLengths, isSignedOff]);
};