export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-svh w-full items-center justify-center overflow-hidden">
      {children}
    </main>
  );
}
