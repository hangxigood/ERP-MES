"use client";

import React, { useState } from "react";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import NextLink from "next/link";
import Image from 'next/image';
import logo from "../../public/images/SMI_logo.png";
import { useRouter } from "next/navigation";

function ForgotPasswordPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        const email = document.getElementById('email').value;
        console.log("handleSubmit called. Email value:", email);

        if (!email) {
            console.log("Email is empty, setting error");
            setError("Email is required");
            return;
        }

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                router.push('/reset-password');
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
                    Forgot Password
                </h1>
                
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <InputField id="email" type="email" />
                    <Button text="Send Reset Link" type="submit" />
                </form>
                {message && <p className="text-green-500 mt-2">{message}</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <NextLink href="/login" className="self-end mt-2.5 text-gray-500 text-opacity-60">Back to Login</NextLink>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
