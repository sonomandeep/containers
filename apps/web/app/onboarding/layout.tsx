import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-svh w-full items-center justify-center overflow-hidden">
      <div className="grid h-full w-full grid-cols-3">
        <section className="col-span-1 overflow-y-auto px-6 py-8">
          <div className="flex min-h-full items-center justify-center">
            {children}
          </div>
        </section>

        <aside
          aria-hidden="true"
          className="relative col-span-2 bg-[url(/assets/clouds.jpg)] bg-center bg-cover bg-no-repeat"
        >
          <Image
            alt=""
            className="object-cover object-left py-24 pl-24"
            fill
            priority
            sizes="66vw"
            src="/assets/mock.png"
          />
        </aside>
      </div>
    </main>
  );
}
