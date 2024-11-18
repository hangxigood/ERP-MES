/**
 * @fileoverview Utility functions for transforming form data between API and UI formats.
 * Handles data type conversions and structure transformations.
 * 
 * @module utils/formDataTransformers
 */

/**
 * Transforms API data into format suitable for DataSheetGrid
 * 
 * @param {Object} data - Raw data from API
 * @param {Array} data.fields - Array of field definitions
 * @returns {Array} Transformed data for grid display
 */
export const transformFormData = (data) => {
  if (!data?.fields) return [];

  const rowCount = Math.max(
    ...data.fields
      .filter(field => Array.isArray(field.fieldValue))
      .map(field => field.fieldValue.length),
    1
  );

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowData = { id: `row_${rowIndex}` };
    data.fields.forEach(field => {
      if (field.fieldType === 'checkbox') {
        rowData[field.fieldName] = Array.isArray(field.fieldValue) 
          ? (field.fieldValue[rowIndex] === 'true' || field.fieldValue[rowIndex] === true)
          : (field.fieldValue === 'true' || field.fieldValue === true);
      } else if (field.fieldType === 'date') {
        const dateValue = Array.isArray(field.fieldValue) ? field.fieldValue[rowIndex] : field.fieldValue;
        rowData[field.fieldName] = dateValue ? new Date(dateValue) : null;
      } else {
        rowData[field.fieldName] = Array.isArray(field.fieldValue) 
          ? (field.fieldValue[rowIndex] ?? '')
          : (field.fieldValue ?? '');
      }
    });
    return rowData;
  });
};

/**
 * Alias for transformFormData, used when refreshing data
 * @type {Function}
 */
export const refreshFormData = transformFormData;