import { FaRegCopyright } from "react-icons/fa6";

export async function Footer() {
  return (
    <footer className="border-t-2 border-gray-700">
      <div className="flex max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-sm italic justify-center items-center">
        <FaRegCopyright />
        <b>Nhan Bach 2024</b>
      </div>
    </footer>
  );
}
