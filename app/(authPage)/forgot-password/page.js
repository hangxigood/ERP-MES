"use client";

import React from "react";
import { useForm } from "react-hook-form";
import NextLink from "next/link";
import Image from 'next/image';
import logo from "../../../public/images/logo.png";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [serverMessage, setServerMessage] = React.useState({ type: "", message: "" });
    const router = useRouter();

    const onSubmit = async (data) => {
        setServerMessage({ type: "", message: "" });

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            const responseData = await response.json();

            if (response.ok) {
                setServerMessage({ 
                    type: "success", 
                    message: responseData.message || "Password reset link has been sent to your email" 
                });
            } else {
                setServerMessage({ 
                    type: "error", 
                    message: responseData.error || "Failed to send reset link" 
                });
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setServerMessage({ 
                type: "error", 
                message: 'An unexpected error occurred. Please try again.' 
            });
        }
    }

    return (
        <div className="flex flex-col items-center text-lg text-black py-36 bg-teal-300">
            <div className="flex flex-col px-14 pt-14 pb-9 bg-white rounded-3xl w-[550px] shadow-lg">
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
               
                {serverMessage.message && (
                    <Alert 
                        variant={serverMessage.type === "error" ? "destructive" : "default"} 
                        className="mb-4"
                    >
                        <AlertDescription>
                            {serverMessage.message}
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
                    
                    <Button type="submit" className="w-full">
                        Send Reset Link
                    </Button>
                </form>

                <NextLink 
                    href="/login" 
                    className="self-end mt-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Back to Login
                </NextLink>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;