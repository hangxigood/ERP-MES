import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import MainContent from '../../../components/MainContent';

export default async function BatchRecordSystem () {

  /**
   * 1. getServerSession is used to check the session on the server side for a server component.
   * 2. The authOptions are passed to getServerSession, which is the recommended way to configure the authentication.
   * 3. If there's no valid session, the user is redirected to the login page using Next.js's redirect function.
   * 4. This approach ensures that unauthenticated users can't access this page and are properly redirected to the login page.
   */
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col bg-white">
      <Header />
      <div className="self-center w-full">
        <div className="flex gap-6">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </div>
  );
};