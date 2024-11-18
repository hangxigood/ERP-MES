
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