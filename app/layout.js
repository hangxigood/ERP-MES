import { Inter } from "next/font/google";
import { SessionProviderWrapper } from "../components/SessionProviderWrapper";
import "./globals.css";
import 'react-datasheet-grid/dist/style.css'
import { initChangeStreams } from '../lib/changeStreamInit';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SMI Batch Record System",
  description: "Electronic Batch Record System for Southmedic Inc.",
};

export default function RootLayout({ children }) {
  initChangeStreams();

  return (  
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
