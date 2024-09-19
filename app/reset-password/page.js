"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/ui/Button";
import NextLink from "next/link";
import Image from 'next/image';
import logo from "../../public/images/SMI_logo.png";

function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!token || !newPassword || !confirmPassword) {
            setError("All fields are required");
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
                        className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
                    />
                    <label htmlFor="confirmPassword" className="block mb-1.5">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded border border-solid border-neutral-700 h-[43px] px-2 mb-4"
                    />
                    <Button text="Reset Password" type="submit" />
                </form>
                {message && <p className="text-green-500 mt-2">{message}</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <NextLink href="/login" className="self-end mt-2.5 text-gray-500 text-opacity-60">Back to Login</NextLink>
            </div>
        </div>
    );
}

export default ResetPasswordPage;