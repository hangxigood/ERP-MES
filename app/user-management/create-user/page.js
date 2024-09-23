'use client'

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../../components/Header';

export default function CreateUser() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // password: '',
    role: 'LABELING',
  });
  const [message, setMessage] = useState('');

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: Only admins can create users</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdById: session.user.id,
          updatedById: session.user.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('User created successfully. A password setup link has been sent to the email.');
        setFormData({ name: '', email: '', password: '', role: 'LABELING' });
      } else {
        setMessage(data.message || 'Error creating user');
      }
    } catch (error) {
      setMessage('Error creating user');
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <Header title="CREATE USER" />
      <div className="self-center w-full max-w-md mt-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {/* <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div> */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="PRODUCTION">Production</option>
              <option value="TEAM_LEADER">Team Leader</option>
              <option value="QA">QA</option>
              <option value="LABELING">Labeling</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create User
            </button>
          </div>
        </form>
        {message && (
          <p className={`text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}