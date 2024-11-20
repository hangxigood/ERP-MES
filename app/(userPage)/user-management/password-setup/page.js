'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from "../../../../public/images/logo.png";

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 5,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const isPasswordSecure = Object.values(passwordCriteria).every(Boolean);

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handleConfirmPasswordFocus = () => {
    if (isPasswordSecure) {
      setShowPasswordRequirements(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!isPasswordSecure) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = new URLSearchParams(window.location.search).get('token');
      const response = await fetch('/api/password-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password set successfully. Redirecting to login...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage(data.error || 'Error setting password');
      }
    } catch (error) {
      setMessage('Error setting password');
    }
  };

  return (
    <div className="flex flex-col items-center text-lg text-black py-36 bg-teal-300">
      <div className="flex flex-col px-14 pt-14 pb-9 bg-white rounded-3xl w-[550px]">
        <Image
          src={logo}
          alt="Batch Record System Logo"
          width={302}
          height={89}
          className="object-contain self-center"
        />
        <h1 className="self-center mb-5 text-1xl text-gray-500">
          Set Your Password
        </h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password" className="block mb-1.5">New Password</label>
          <input
            className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handlePasswordFocus}
            required
          />
          <label htmlFor="confirmPassword" className="block mb-1.5">Confirm Password</label>
          <input
            className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={handleConfirmPasswordFocus}
            required
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Set Password
          </button>
          {showPasswordRequirements && (
            <div className="py-2 text-gray-500">
              <p className="mt-2 mb-1">Please use a password with:</p>
              <ul className="list-disc pl-5">
                <li className={passwordCriteria.length ? "text-green-500" : ""}>
                  At least 5 characters long
                </li>
                <li className={passwordCriteria.lowercase ? "text-green-500" : ""}>
                  Contains a lowercase letter
                </li>
                <li className={passwordCriteria.uppercase ? "text-green-500" : ""}>
                  Contains an uppercase letter
                </li>
                <li className={passwordCriteria.number ? "text-green-500" : ""}>
                  Contains a number
                </li>
                <li className={passwordCriteria.special ? "text-green-500" : ""}>
                  Contains a special character
                </li>
              </ul>
            </div>
          )}
        </form>
        {message && <p className="text-green-500 mt-2">{message}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}