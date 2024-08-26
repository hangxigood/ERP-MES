"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";  // Changed from next/router
import InputField from "./components/InputField";
import Button from "./components/Button";
import Link from "./components/Link";

function LoginPage() {
    const [error, setError] = useState("");
    const router = useRouter();
    // useSession is used to check the session on the client side for a client component.
    const { status } = useSession();

    // Redirect if already logged in
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/records/header");
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
        } else {
            router.push("/records/header");
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
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/513de61559510b87f84a70534f7dd3f9245b2e3b6ba8e0e0fd12a7d1329ea0d9?apiKey=2b08548dcb384abfa0a328fedffac42b&&apiKey=2b08548dcb384abfa0a328fedffac42b" alt="Batch Record System Logo" className="object-contain self-center max-w-full aspect-[3.39] w-[302px]" />
                <h1 className="self-center mb-5 text-1xl text-gray-500">
                    BATCH RECORD SYSTEM
                </h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <InputField label="Email" id="email" type="email" required />
                    <InputField label="Password" id="password" type="password" required />
                    <Button text="LOGIN" type="submit" />
                </form>
                <Link href="/forgot-password" text="Forgot Password?" className="self-end mt-2.5 text-gray-500 text-opacity-60" />
                <p className="self-center mt-28 text-center text-gray-500 text-opacity-60 max-md:mt-10">
                    Need an account? <Link href="/signup" text="SIGN UP" underline />
                </p>
            </div>
        </div>
    );
}

export default LoginPage;