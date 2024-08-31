import React from 'react';
import Header from "../../../../../components/Header";
import LineClearanceForm from "../../../../../components/LineClearanceForm";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/authOptions";
import { cookies } from 'next/headers'

async function fetchLineClearanceData(id) {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(`/api/batchRecords`, baseUrl);
  url.searchParams.append('id', id);
  url.searchParams.append('formType', 'lineClearance');
  console.log("URL:", url.toString());

  try {
    const session = await getServerSession(authOptions);
    console.log("Session for page:", session)
   
    // Get the session token directly from the cookies
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value
    

    if (!sessionToken) {
      throw new Error('Session token not found. Please log in again.')
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      // headers: {
      //   'Cookie': `next-auth.session-token=${sessionToken}`,
      // },
    });
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired or invalid. Please log in again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } 
    else {
      throw new Error('Received unexpected non-JSON response');
    }
  } catch (error) {
    console.error('Error fetching line clearance data:', error);
    throw error;
  }
}

export default async function LineClearancePage({ params }) {
  try {
    const lineClearanceData = await fetchLineClearanceData(params.id);
    
    // If no data is returned, create an empty initial data object
    const initialData = lineClearanceData && Object.keys(lineClearanceData).length > 0
      ? lineClearanceData
      : { batchNumber: params.id }; // Use the ID from the URL as the batch number

    return (
      <div className="flex flex-col bg-white">
        <Header title={`Line Clearance: Batch ${initialData.batchNumber}`} />
        <div className="self-center w-full max-w-4xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {Object.keys(lineClearanceData).length > 0 ? 'Line Clearance Form' : 'New Line Clearance Form'}
          </h2>
          <LineClearanceForm initialData={initialData} batchId={params.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in LineClearancePage:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">{error.message}</p>
        {(error.message.includes('Please log in') || error.message.includes('Session expired')) && (
          <a href="/api/auth/signin" className="mt-4 text-blue-500 hover:underline">
            Go to Login Page
          </a>
        )}
      </div>
    );
  }
}
