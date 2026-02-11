import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-svh w-full items-center justify-center overflow-hidden">
      <div className="grid h-full w-full grid-cols-5">
        <section className="col-span-2">{children}</section>

        <aside
          aria-hidden="true"
          className="relative col-span-3 bg-[url(/assets/clouds.jpg)] bg-center bg-cover bg-no-repeat"
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
