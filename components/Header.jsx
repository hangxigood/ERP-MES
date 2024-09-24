"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link'; // Add this import

const Header = ({ title }) => {
  const { data: session } = useSession();

  return (
    <header className="flex gap-5 justify-between px-16 py-8 w-full text-2xl font-bold text-white bg-neutral-700 max-md:flex-wrap max-md:px-5 max-md:max-w-full">
      <Link href="/" className="my-auto">
        {title}
      </Link>
      {session && (
        <div className="flex items-center gap-5">
          <span>{session.user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
