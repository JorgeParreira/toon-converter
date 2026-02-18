import { House } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-slate-900">
      <div className="flex justify-start gap-10 items-center max-w-5xl  p-4">
        <Link to="/" className="ml-[55px] text-sm text-gray-300 hover:text-white">
          <House size={25} />
        </Link>

        <Link to="/api" className="text-sm text-gray-300 hover:text-white size-25 ">
          API Playground
        </Link>
      </div>
    </header>
  );
}
