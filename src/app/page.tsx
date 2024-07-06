import Image from "next/image";
import "@/app/styles/background.scss";

export default function Home() {
  return (
    <main>
      <div className="py-2 flex items-center justify-center text-center">
        <div className="px-20 py-32 space-y-2">
          <h1 className="text-3xl lg:text-3xl xl:text-4xl font-bold ">A new way to create your documents</h1>
          <h1 className="text-3xl lg:text-3xl xl:text-4xl ">Easier and faster than ever.</h1>
        </div>
      </div>
    </main>
  );
}
