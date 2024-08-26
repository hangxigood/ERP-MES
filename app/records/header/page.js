import React from 'react';
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/authOptions";
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import MainContent from '../../../components/MainContent';

export default async function BatchRecordSystem () {

  /**
   * 1. getServerSession is used to check the session on the server side for a server component, 
   * 2. since useSession() is a client component so it's not possible to use it here.
   * 3. we may need to use session information like role in the future
   */
  const session = await getServerSession(authOptions);

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