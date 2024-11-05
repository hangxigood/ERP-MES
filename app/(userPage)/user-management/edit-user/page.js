'use client'

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../../../components/Header';

export default function EditUser() {
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState('');
  const [fieldsToUpdate, setFieldsToUpdate] = useState([]);
  const [updatedValues, setUpdatedValues] = useState({});
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: Only admins can edit users</div>;
  }

  const handleFieldSelection = (field) => {
    setFieldsToUpdate(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleValueChange = (field, value) => {
    setUpdatedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmUpdate = async () => {
    try {
      const response = await fetch('/api/edit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          updatedFields: fieldsToUpdate.reduce((acc, field) => {
            acc[field] = updatedValues[field];
            return acc;
          }, {}),
          adminPassword,
          adminId: session.user.id
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('User updated successfully');
        // Reset form
        setUserEmail('');
        setFieldsToUpdate([]);
        setUpdatedValues({});
        setAdminPassword('');
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        // Reset select fields
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          select.value = '';
        });
      } else {
        setMessage(data.message || 'Error updating user');
      }
    } catch (error) {
      setMessage('Error updating user');
    }
    setShowConfirmation(false);
  };

  return (
    <div className="flex flex-col bg-white">
      <Header title="EDIT USER" />
      <div className="self-center w-full max-w-md mt-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              User&apos;s Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fields to Update
            </label>
            <div>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" className="form-checkbox" onChange={() => handleFieldSelection('email')} />
                <span className="ml-2">Email</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" className="form-checkbox" onChange={() => handleFieldSelection('name')} />
                <span className="ml-2">Name</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" onChange={() => handleFieldSelection('role')} />
                <span className="ml-2">Role</span>
              </label>
            </div>
          </div>

          {fieldsToUpdate.includes('email') && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newEmail">
                New Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newEmail"
                type="email"
                onChange={(e) => handleValueChange('email', e.target.value)}
                required
              />
            </div>
          )}

          {fieldsToUpdate.includes('name') && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                New Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                onChange={(e) => handleValueChange('name', e.target.value)}
                required
              />
            </div>
          )}

          {fieldsToUpdate.includes('role') && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                New Role
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="role"
                onChange={(e) => handleValueChange('role', e.target.value)}
                required
              >
                <option value="">Select a role</option>
                <option value="ADMIN">Admin</option>
                <option value="PRODUCTION">Production</option>
                <option value="TEAM_LEADER">Team Leader</option>
                <option value="QA">QA</option>
                <option value="LABELING">Labeling</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Update User
            </button>
          </div>
        </form>
        {message && (
          <p className={`text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Update</h2>
            <p>You are about to update the following fields for {userEmail}:</p>
            <ul className="list-disc list-inside mb-4">
              {fieldsToUpdate.map(field => (
                <li key={field}>{field}: {updatedValues[field]}</li>
              ))}
            </ul>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Enter your password to confirm:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={confirmUpdate}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}