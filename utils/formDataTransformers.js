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

/**
 * Transforms grid data into API submission format
 * 
 * @param {Array} fields - Field definitions from initial data
 * @param {Array} formData - Current form data from grid
 * @returns {Array} Transformed data for API submission
 */
export const transformSubmissionData = (fields, formData) => {
  return fields.map(field => ({
    fieldName: field.fieldName,
    fieldType: field.fieldType,
    fieldValue: formData.map(row => {
      if (field.fieldType === 'checkbox') {
        return row[field.fieldName] ? 'true' : 'false';
      } else if (field.fieldType === 'date') {
        return row[field.fieldName] ? row[field.fieldName].toISOString().split('T')[0] : '';
      }
      return row[field.fieldName] || '';
    })
  }));
};