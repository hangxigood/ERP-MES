"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../../components/ui/Button";
import NextLink from "next/link";
import Image from 'next/image';
import logo from "../../../public/images/SMI_logo.png";

// Add this export to prevent static generation
export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        setPasswordCriteria({
            length: newPassword.length >= 5,
            lowercase: /[a-z]/.test(newPassword),
            uppercase: /[A-Z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        });
    }, [newPassword]);

    const isPasswordSecure = Object.values(passwordCriteria).every(Boolean);

    const handleNewPasswordFocus = () => {
        setShowPasswordRequirements(true);
    };

    const handleConfirmPasswordFocus = () => {
        if (isPasswordSecure) {
            setShowPasswordRequirements(false);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!token || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (!isPasswordSecure) {
            setError("Please meet all password requirements");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred. Please try again.');
        }
    }

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
                    Reset Password
                </h1>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="newPassword" className="block mb-1.5">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={handleNewPasswordFocus}
                        className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
                    />

                    <label htmlFor="confirmPassword" className="block mb-1.5">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={handleConfirmPasswordFocus}
                        className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
                    />
                    <Button text="Reset Password" type="submit" />

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
                <NextLink href="/login" className="self-end mt-2.5 text-gray-500 text-opacity-60">Back to Login</NextLink>
            </div>
        </div>
    );
}

function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center text-lg text-black py-36 bg-teal-300">
                <div className="flex flex-col px-14 pt-14 pb-9 bg-white rounded-3xl w-[550px]">
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

export default ResetPasswordPage;