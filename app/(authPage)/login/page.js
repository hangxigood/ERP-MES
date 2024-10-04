"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";  // Changed from next/router
import InputField from "../../../components/ui/InputField";
import Button from "../../../components/ui/Button";
import Link from "../../../components/ui/Link";
import Image from 'next/image';
import logo from "../../../public/images/SMI_logo.png";
import NextLink from "next/link";


function LoginPage() {
    const [error, setError] = useState("");
    const router = useRouter();
    // useSession is used to check the session on the client side for a client component.
    const { status } = useSession();

    // Redirect if already logged in
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        /**
         * 1. signIn is used to sign in the user with the credentials.
         * 2. The credentials are passed to signIn, which is the recommended way to configure the authentication.
         * 3. The redirect is set to false to prevent the user from being redirected to the login page.
         * 4. The email and password are passed to signIn, which is the recommended way to configure the authentication.    
         */
        const result = await signIn('credentials', {
            redirect: false,
            email: e.target.email.value,
            password: e.target.password.value,
        });
        if (result?.error) {
            setError("Invalid email or password");
        }
    };
    
    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "authenticated") {
        return <div>Redirecting...</div>;
    }

    return (
        <div className="flex flex-col items-center text-lg text-black py-36 bg-teal-300">
            <div className="flex flex-col px-14 pt-14 pb-9 bg-white rounded-3xl w-[550px]">
                <Image
                    src={logo}
                    alt="Batch Record System Logo"
                    width={302}
                    height={89} // Adjust this based on your logo's aspect ratio
                    className="object-contain self-center"
                />
                <h1 className="self-center mb-5 text-1xl text-gray-500">
                    BATCH RECORD SYSTEM
                </h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <InputField label="Email" id="email" type="email" required />
                    <InputField label="Password" id="password" type="password" required />
                    <Button text="LOGIN" type="submit" />
                </form>
                <NextLink href="/forgot-password" className="self-end mt-2.5 text-gray-500 text-opacity-60">
                    Forgot Password?
                </NextLink>
                <p className="self-center mt-28 text-center text-gray-500 text-opacity-60 max-md:mt-10">
                    Need an account? <Link href="/signup" text="SIGN UP" underline />
                </p>
            </div>
        </div>
    );
}

export default LoginPage;