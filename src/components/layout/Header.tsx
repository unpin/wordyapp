// Removed "use client" — this component has no hooks or state, it's a pure
// layout wrapper. In Next.js App Router, server components can import client
// components (SearchBar, Nav handle their own client boundaries).
import SearchBar from "../features/SearchBar";
import Nav from "./Nav";

export default function Header() {
  return (
    <header className="relative z-10 max-w-7xl mx-auto flex gap-4">
      <div className="lg:max-w-4/6 w-full">
        <SearchBar />
      </div>

      <div className="lg:w-2/6 flex justify-end">
        <Nav />
      </div>
    </header>
  );
}
