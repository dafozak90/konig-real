import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-slate-950 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between">
                <h1 className="text-2xl font-bold text-yellow-500"> 
                    KÖNIG - REAL
              </h1>

              <div className="flex gap-6">
                <Link href="/">Domov</Link>
                <Link href="/properties">Ponuka</Link>
                <Link href="/contact">Kontakt</Link>
              </div>
            </div>
        </nav>
    );
}