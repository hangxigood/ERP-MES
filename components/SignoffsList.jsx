/**
 * @fileoverview Component for displaying a list of sign-offs in a batch record.
 * Shows sign-off history including who signed, when, and any comments.
 * 
 * @module components/SignoffsList
 */

/**
 * Sign-offs list display component
 * 
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.signoffs] - Array of sign-off records
 * @param {string} props.signoffs[].signedBy - Name of person who signed
 * @param {string} props.signoffs[].signedAt - Timestamp of sign-off
 * @param {string} [props.signoffs[].comment] - Optional comment for sign-off
 * @returns {React.ReactElement|null} Sign-offs list or null if no sign-offs
 */
export const SignoffsList = ({ signoffs }) => {
  if (!signoffs?.length) return null;
  
  return (
    <div className="mt-4 mb-4 p-4 bg-gray-100 rounded text-gray-500">
      <h3 className="font-bold">Sign-offs</h3>
      {signoffs.map((signoff, index) => (
        <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
          <p>By: {signoff.signedBy}</p>
          <p>At: {new Date(signoff.signedAt).toLocaleString()}</p>
          {signoff.comment && <p>Comment: {signoff.comment}</p>}
        </div>
      ))}
    </div>
  );
};