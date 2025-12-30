import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CaseView3D - Dental 3D Viewer",
    description: "Professional dental 3D model sharing and viewing platform",
    manifest: "/manifest.json",
    themeColor: "#1e40af",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "CaseView3D",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
                <script src="https://cdn.iamport.kr/v1/iamport.js"></script>
            </body>
        </html>
    );
}
