import React, { useState } from 'react';

const PasswordModal = ({ onClose, onSubmit, title = "Confirm Sign-off" }) => {
  const [password, setPassword] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password, comment);
  };

  // Derive showComment and buttonText from title
  const showComment = title === "Confirm Sign-off";
  const buttonText = title;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-700">{title}</h2>
        <form onSubmit={handleSubmit}>
          {showComment && (
            <div className="mb-4">
              <label htmlFor="comment" className="block mb-2 text-gray-700">Comment (optional):</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded text-gray-700"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-700"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 rounded text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;