import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-svh w-full items-center justify-center overflow-hidden">
      <div className="grid h-full w-full grid-cols-5">
        <main className="col-span-2">{children}</main>

        <section className="relative col-span-3 bg-[url(/assets/clouds.jpg)]">
          <Image
            alt="Paper dashboard"
            className="object-cover object-left py-24 pl-24"
            fill
            priority
            sizes="66vw"
            src="/assets/mock.png"
          />
        </section>
      </div>
    </main>
  );
}
