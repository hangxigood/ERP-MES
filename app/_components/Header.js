"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";

const Header = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/login"); // Redirect to login
    }
  }, [status]);



  return (
    <header className="flex gap-5 justify-between px-16 py-8 w-full text-2xl font-bold text-white bg-neutral-700 max-md:flex-wrap max-md:px-5 max-md:max-w-full">
      <div className="my-auto">BATCH RECORD SYSTEM</div>
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
