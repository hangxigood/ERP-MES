"use client";

import React from 'react';
import logo from "../public/images/SMI_logo.png";
import option from "../public/images/option.svg";
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import SectionItem from '../components/SectionItem';


const Home = () => {

  const { data: session } = useSession();

  return (
    <main className="flex overflow-hidden flex-col items-start pt-14 pr-10 pb-9 pl-20 text-base bg-white text-stone-900 max-md:px-5">
      <header className="flex flex-wrap gap-5 justify-between self-center w-full text-3xl text-center text-gray-500 max-w-[1256px] max-md:max-w-full">
        <Image
            src={logo}
            alt="Batch Record System Logo"
            width={302}
            height={89} // Adjust this based on your logo's aspect ratio
            className="object-contain self-center"
        />
        <h1 className="my-auto">BATCH RECORD SYSTEM</h1>
      </header>

      {session && (
        <h2 className="mt-9 ml-2.5 text-2xl font-bold text-gray-500">
          Welcome {session.user.name}
        </h2>
      )}

      <a href="/new-batch-record" className="hover:underline">
        <SectionItem icon={option} text="New Batch Record"/>
      </a>
      <a href="/batch-record" className="hover:underline">
        <SectionItem icon={option} text="Open Existing Batch Record"/>
      </a>
      <a href="/user-management" className="hover:underline">
        <SectionItem icon={option} text="User Management"/>
      </a>
      <a href="/audit-log" className="hover:underline">
        <SectionItem icon={option} text="Audit Log"/>

      </a>

      <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="self-end px-16 py-3 max-w-full text-lg text-center text-black bg-teal-300 rounded mt-[511px] w-[432px] ">
        LOG OUT
      </button>
    </main>
  );
};

export default Home;