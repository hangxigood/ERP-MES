import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(hasChanges: boolean) {
  const router = useRouter();

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    },
    [hasChanges]
  );

  useEffect(() => {
    // Handle browser back/forward and page refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle client-side navigation
    const handleBeforePopState = () => {
      if (hasChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        );
        if (!confirmLeave) {
          // Stay on the current page
          window.history.pushState(null, '', window.location.href);
          return false;
        }
      }
      return true;
    };

    window.addEventListener('popstate', handleBeforePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforePopState);
    };
  }, [hasChanges, handleBeforeUnload]);

  const routerPush = (url: string) => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.push(url);
  };

  return { routerPush };
} 