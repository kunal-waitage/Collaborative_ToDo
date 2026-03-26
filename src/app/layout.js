import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Collaborative ToDo",
  description: "Real-Time Collaborative ToDo App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
          integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://kit.fontawesome.com/cf372e492c.js"
        />
        <script
          src="https://kit.fontawesome.com/cf372e492c.js"
          crossOrigin="anonymous"
          async
        ></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
