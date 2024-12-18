"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import logo from "../../../public/images/logo.png";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    const onSubmit = async (data) => {
        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
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
        <div className="min-h-screen flex items-center justify-center bg-teal-300">
            <div className="w-[550px] bg-white rounded-3xl shadow-lg p-14">
                <Image
                    src={logo}
                    alt="Batch Record System Logo"
                    width={302}
                    height={89}
                    className="object-contain mx-auto"
                />
                <h1 className="text-center mb-5 text-1xl text-gray-500">
                    BATCH RECORD SYSTEM
                </h1>
                <p className="text-center mb-5 text-1xl text-gray-500">
                    admin@DOGE.com/SMIpassword
                </p>
                {errors.root?.serverError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                            {errors.root.serverError.message}
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full">
                        LOGIN
                    </Button>
                </form>
                <NextLink 
                    href="/forgot-password" 
                    className="block text-right mt-2.5 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Forgot Password?
                </NextLink>
                <p className="text-center mt-10 text-gray-500">
                    Need an account?{" "}
                    <NextLink 
                        href="/signup" 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        SIGN UP
                    </NextLink>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;