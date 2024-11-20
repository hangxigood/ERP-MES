import { Inter } from "next/font/google";
import { SessionProviderWrapper } from "../components/SessionProviderWrapper";
import 'react-datasheet-grid/dist/style.css'
import "./globals.css";
import { initChangeStreams } from '../lib/changeStreamInit';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DOGE Batch Record System",
  description: "Electronic Batch Record System for DOGE Inc.",
};

export default function RootLayout({ children }) {
  // initChangeStreams(); // Initialize change streams of mongoDB

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
