"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from 'next/image';
import logo from "../../../public/images/logo.png";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Add this export to prevent static generation
export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
    const { register, handleSubmit, watch, formState: { errors }, setError: setFormError } = useForm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = React.useState("");
    const [showPasswordRequirements, setShowPasswordRequirements] = React.useState(false);
    const [serverMessage, setServerMessage] = React.useState({ type: "", message: "" });

    const password = watch("newPassword", "");

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const validatePassword = (value) => {
        const criteria = {
            length: value.length >= 5,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };

        if (!Object.values(criteria).every(Boolean)) {
            return "Password must meet all requirements";
        }

        return true;
    };

    const onSubmit = async (data) => {
        setServerMessage({ type: "", message: "" });

        if (!token) {
            setServerMessage({ type: "error", message: "Reset token is missing" });
            return;
        }

        if (data.newPassword !== data.confirmPassword) {
            setFormError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match"
            });
            return;
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: data.newPassword }),
            });

            const responseData = await response.json();

            if (response.ok) {
                setServerMessage({ type: "success", message: responseData.message });
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setServerMessage({ type: "error", message: responseData.error });
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setServerMessage({ type: "error", message: 'An unexpected error occurred. Please try again.' });
        }
    };

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
                    Reset Password
                </h1>

                {serverMessage.message && (
                    <Alert variant={serverMessage.type === "error" ? "destructive" : "default"} className="mb-4">
                        <AlertDescription>
                            {serverMessage.message}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...register("newPassword", {
                                required: "Password is required",
                                validate: validatePassword
                            })}
                            onFocus={() => setShowPasswordRequirements(true)}
                            className={errors.newPassword ? "border-red-500" : ""}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: value => value === password || "Passwords do not match"
                            })}
                            onFocus={() => setShowPasswordRequirements(false)}
                            className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {showPasswordRequirements && (
                        <div className="py-2 text-sm text-gray-500">
                            <p className="font-medium mb-2">Password Requirements:</p>
                            <ul className="space-y-1 list-disc pl-5">
                                <li className={password.length >= 5 ? "text-green-500" : ""}>
                                    At least 5 characters long
                                </li>
                                <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                                    Contains a lowercase letter
                                </li>
                                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                                    Contains an uppercase letter
                                </li>
                                <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                                    Contains a number
                                </li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : ""}>
                                    Contains a special character
                                </li>
                            </ul>
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Reset Password
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

function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center text-lg text-black py-36 bg-teal-300">
                <div className="flex flex-col px-14 pt-14 pb-9 bg-white rounded-3xl w-[550px] shadow-lg">
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

export default ResetPasswordPage;