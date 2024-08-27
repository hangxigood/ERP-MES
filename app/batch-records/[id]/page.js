'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * This component is used to redirect the user to the line clearance page of a batch record.
 * It is used to handle the case where the user navigates to the batch record page directly.
 * This is done to avoid the issue of the page not being found.
 */
export default function BatchRecordRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.push(`/batch-records/${id}/line-clearence`);
    }
  }, [id, router]);

  return null; // This component doesn't render anything
}
