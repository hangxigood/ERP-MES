/**
 * @fileoverview Modal component for password verification with optional comment input.
 * Used for both sign-off and submission confirmations.
 * 
 * @module components/PasswordModal
 */

import React from 'react';

/**
 * Password verification modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to display the modal
 * @param {Function} props.onClose - Handler for modal close
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {string} props.title - Modal title/purpose
 * @returns {React.ReactElement|null} Modal component or null if not shown
 */
const PasswordModal = ({ show, onClose, onSubmit, title }) => {
  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const comment = formData.get('comment');
    await onSubmit(password, comment);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white p-6 rounded-lg">
        <h2 id="modal-title" className="text-xl font-bold mb-4 text-gray-700">
          {title}
        </h2>
        <form onSubmit={handleSubmit} aria-label={title}>
          {title.includes('Sign-off') && (
            <div className="mb-4">
              <label htmlFor="comment" className="block mb-2 text-gray-700">
                Comment (optional):
              </label>
              <textarea
                id="comment"
                name="comment"
                className="w-full p-2 border rounded text-gray-700"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full p-2 border rounded text-gray-700"
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
              {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;