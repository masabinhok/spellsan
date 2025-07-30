"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const Navigation = () => {
  const pathname = usePathname();
  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />{" "}
        </svg>
      ),
    },
    {
      href: "/learn",
      label: "Learn Words",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.247 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
          />{" "}
        </svg>
      ),
    },
    {
      href: "/practice",
      label: "Practice",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />{" "}
        </svg>
      ),
    },
    {
      href: "/progress",
      label: "Progress",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />{" "}
        </svg>
      ),
    },
    {
      href: "/voice-settings",
      label: "Voice Settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />{" "}
        </svg>
      ),
    },
  ];
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="flex justify-between items-center py-4">
          {" "}
          {/* Logo */}{" "}
          <Link href="/" className="flex items-center space-x-3">
            {" "}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              {" "}
              <span className="text-white font-bold text-lg">S</span>{" "}
            </div>{" "}
            <div>
              {" "}
              <h1 className="text-2xl font-bold text-blue-600">
                {" "}
                SpellSAN{" "}
              </h1>{" "}
              <p className="text-xs text-slate-500 -mt-1">
                {" "}
                Spelling Excellence{" "}
              </p>{" "}
            </div>{" "}
          </Link>{" "}
          {/* Navigation Links */}{" "}
          <div className="hidden md:flex items-center space-x-1">
            {" "}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${pathname === item.href ? "bg-blue-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {" "}
                {item.icon}{" "}
                <span className="font-medium">{item.label}</span>{" "}
              </Link>
            ))}{" "}
          </div>{" "}
          {/* Mobile Menu Button */}{" "}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {" "}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />{" "}
            </svg>{" "}
          </button>{" "}
        </div>{" "}
        {/* Mobile Navigation */}{" "}
        <div className="md:hidden pb-4">
          {" "}
          <div className="flex flex-col space-y-2">
            {" "}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === item.href ? "bg-blue-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {" "}
                {item.icon}{" "}
                <span className="font-medium">{item.label}</span>{" "}
              </Link>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </nav>
  );
};
export default Navigation;
