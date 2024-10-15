"use client";

import React from 'react';
import Header from '../../../components/Header'; 
import { useSession } from 'next-auth/react';
import SectionItem from '../../../components/SectionItem'; 
import option from "../../../public/images/option.svg";  
import Link from 'next/link';  

export default function UserManagement() {

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: Only admins can manage users</div>;
  }

  return (
    <div className="flex flex-col bg-white">
       <div className="flex flex-col bg-white">
            <Header title="USER MANAGEMENT" />

            <Link href="/user-management/create-user" className="hover:underline text-black">
                <SectionItem icon={option} text="Create New User"/>
            </Link>
            <Link href="/user-management/edit-user" className="hover:underline text-black">
                <SectionItem icon={option} text="Edit User"/>
            </Link>
        </div>
    </div>
  );
};