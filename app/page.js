"use client";

import React from 'react';
import logo from "../public/images/logo.png";
import option from "../public/images/option.svg";
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import SectionItem from '../components/SectionItem';
import { Button } from "@/components/ui/button";

const Home = () => {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex flex-col bg-white text-stone-900">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-[1256px] flex flex-col">
        <header className="flex flex-wrap gap-5 justify-between w-full text-3xl text-center text-gray-500">
          <h1 className="my-auto">DOGE BATCH RECORD SYSTEM</h1>
        </header>

        {session && (
          <h2 className="mt-8 text-2xl font-bold text-gray-500">
            Welcome {session.user.name}
          </h2>
        )}

        <nav className="mt-8 space-y-4 flex-grow">
          <a href="/new-batch-record" className="block hover:underline">
            <SectionItem icon={option} text="New Batch Record"/>
          </a>
          <a href="/batch-record" className="block hover:underline">
            <SectionItem icon={option} text="Open Existing Batch Record"/>
          </a>
          <a href="/user-management" className="block hover:underline">
            <SectionItem icon={option} text="User Management"/>
          </a>
          <a href="/audit-log" className="block hover:underline">
            <SectionItem icon={option} text="Audit Log"/>
          </a>
        </nav>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-[432px] max-w-full bg-teal-300 hover:bg-teal-400 text-lg py-6"
          >
            LOG OUT
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Home;