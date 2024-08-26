"use client";

import { SessionProvider } from "next-auth/react";

/**
 * 1. SessionProviderWrapper is used to wrap the children components with the SessionProvider.
 * 2. The SessionProvider is used to provide the session to the children components.
 */

export function SessionProviderWrapper ({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
};