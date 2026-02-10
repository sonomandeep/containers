import Image from "next/image";

export default async function Page() {
  return (
    <div className="grid h-full w-full grid-cols-3">
      <div className="col-span-1">hello</div>

      <div className="relative col-span-2 bg-[url(/assets/clouds.jpg)]">
        <Image
          alt="Paper dashboard"
          className="object-cover object-left py-24 pl-24"
          fill
          priority
          sizes="66vw"
          src="/assets/mock.png"
        />
      </div>
    </div>
  );
}
