export function calculateFieldDiffs(oldFields, newFields, sectionName) {
  const changes = [];

  newFields.forEach((newField, fieldIndex) => {
    const oldField = oldFields[fieldIndex];
    if (!oldField) return;

    // Get values, handling both array and non-array cases
    const oldValues = Array.isArray(oldField.fieldValue) ? oldField.fieldValue : [oldField.fieldValue];
    const newValues = Array.isArray(newField.fieldValue) ? newField.fieldValue : [newField.fieldValue];

    // Compare values at each index
    newValues.forEach((newValue, valueIndex) => {
      const oldValue = oldValues[valueIndex];
      
      if (newValue !== oldValue && newValue !== '' && newValue !== null) {
        changes.push({
          sectionName: sectionName,
          fieldName: newField.fieldName,
          fieldType: newField.fieldType,
          oldValue: oldValue || '',
          newValue: newValue,
          // Add row information for array values
          rowInfo: Array.isArray(newField.fieldValue) ? {
            index: valueIndex,
            total: newValues.length
          } : null
        });
      }
    });
  });

  return changes;
}

export function processHistoryEntry(entry, previousEntry = null) {
  return {
    version: entry.version,
    timestamp: entry.timestamp,
    user: entry.metadata?.userId ? {
      name: entry.metadata.userId.name,
      email: entry.metadata.userId.email,
      role: entry.metadata.userId.role
    } : null,
    changes: previousEntry ? 
      calculateFieldDiffs(previousEntry.fieldsSnapshot, entry.fieldsSnapshot, entry.sectionName) : 
      []
  };
}