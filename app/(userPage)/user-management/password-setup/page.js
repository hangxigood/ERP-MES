'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from "../../../../public/images/logo.png";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff, Check, X } from "lucide-react";

export default function SetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const password = watch("password", "");

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

  const onSubmit = async (data) => {
    if (!isPasswordSecure) {
      toast({
        title: "Error",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = new URLSearchParams(window.location.search).get('token');
      const response = await fetch('/api/password-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password set successfully. Redirecting to login...",
          variant: "success",
        });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        toast({
          title: "Error",
          description: responseData.error || 'Error setting password',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error setting password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      )}
      <span className={met ? "text-green-500" : "text-gray-500"}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-300 p-4">
      <Card className="w-full max-w-[550px]">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Image
            src={logo}
            alt="Batch Record System Logo"
            width={302}
            height={89}
            className="object-contain mb-4"
          />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Set Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true })}
                  className="pr-10"
                  onFocus={() => setShowPasswordRequirements(true)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", { required: true })}
                  className="pr-10"
                  onFocus={() => setShowPasswordRequirements(false)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {showPasswordRequirements && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="text-sm font-medium">Password Requirements:</div>
                <div className="space-y-2">
                  <PasswordRequirement 
                    met={passwordCriteria.length} 
                    text="At least 5 characters long" 
                  />
                  <PasswordRequirement 
                    met={passwordCriteria.lowercase} 
                    text="Contains a lowercase letter" 
                  />
                  <PasswordRequirement 
                    met={passwordCriteria.uppercase} 
                    text="Contains an uppercase letter" 
                  />
                  <PasswordRequirement 
                    met={passwordCriteria.number} 
                    text="Contains a number" 
                  />
                  <PasswordRequirement 
                    met={passwordCriteria.special} 
                    text="Contains a special character" 
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={!password || !watch("confirmPassword")}
            >
              Set Password
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}