import React from 'react';
import './globals.css';

export const metadata = {
    title: 'Sharath Kulkarni - Operator Interface',
    description: 'Building applied AI systems for specialty care',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
