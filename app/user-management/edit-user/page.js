'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../../components/Header';

export default function EditUser() {
  const { data: session, status } = useSession();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [possibleMatches, setPossibleMatches] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fieldsToUpdate, setFieldsToUpdate] = useState([]);
  const [updatedValues, setUpdatedValues] = useState({});
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/edit-user');
      const data = await response.json();
      if (response.ok) {
        setAllUsers(data.users);
        setFilteredUsers(data.users);  // Initialize filtered users with all users
      } else {
        setMessage(data.message || 'Error fetching users');
      }
    } catch (error) {
      setMessage('Error fetching users');
    }
  };

  useEffect(() => {
    const filtered = allUsers.filter(user => 
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      user.name.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchEmail, searchName, allUsers]);

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
    if (fieldsToUpdate.length === 0) {
      setMessage('No changes were made');
      setShowConfirmation(false);
      return;
    }

    try {
      const response = await fetch('/api/edit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedUser.email,
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
        fetchUsers();  // Refresh the user list after successful update
        // Reset form
        setSearchEmail('');
        setSearchName('');
        setPossibleMatches([]);
        setSelectedUser(null);
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUpdatedFields({});
    setSearchEmail(user.email);
    setSearchName(user.name);
  };

  const handleFieldChange = (field, value) => {
    setUpdatedFields(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col bg-white">
      <Header title="EDIT USER" />
      <div className="self-center w-full max-w-4xl mt-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex mb-4">
            <div className="w-1/2 pr-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchEmail">
                Filter by Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="searchEmail"
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter partial or full email"
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchName">
                Filter by Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="searchName"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter partial or full name"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select User
            </label>
            <div className="border rounded h-48 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.email} 
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedUser && selectedUser.email === user.email ? 'bg-blue-100' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{user.name} ({user.email})</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No users match the current filters</div>
              )}
            </div>
          </div>

          {selectedUser && (
            <>
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
            </>
          )}
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
            <p>You are about to update the following fields for {selectedUser.email}:</p>
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

// Helper function to get the appropriate color for each role
function getRoleColor(role) {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-200 text-red-800';
    case 'MANAGER':
      return 'bg-blue-200 text-blue-800';
    case 'USER':
      return 'bg-green-200 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}