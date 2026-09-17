export const dynamic = "force-dynamic";

import { supabase } from "../lib/supabase";
import Link from "next/link";

export default async function Home() {
    const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
   .limit(3);

    return (
        <>
            <section
                className="min-h-screen bg-cover bg-center flex items-center justify-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000')",
                }}
            >
                <div className="bg-black/60 p-10 rounded-3xl text-center text-white">
                    <h1 className="text-6xl md:text-8xl font-bold text-yellow-500 mb-6">
                        KÖNIG - REAL
                    </h1>

                    <p className="text-xl md:text-2xl mb-8">
                    Váš domov. Naša priorita. 
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/properties"
                            className="bg-yellow-500 text-black px-8 py-4 rounded-2xl"
                        >
                            Ponuka nehnuteľností    
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-5xl font-bold text-center mb-12">
                        Vybrané nehnuteľnosti
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                       {properties?.map((property) => (
                         <div
                            key={property.id}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden"
                        >
                            <img
                                src={property.image_url}
                                alt={property.title}
                                className="h-64 w-full object-cover"
                            />
                            <div className="p-6">
                               <h3 className="text-2xl font-bold">
                                {property.title}
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    {property.location}
                                </p>

                                <p className="text-yellow-600 text-3xl font-bold mt-4">
                                    {Number(property.price).toLocaleString("sk-SK")} €
                                </p>

                                <a
                                   href={`/property/${property.id}`}
                                   className="inline-block mt-6 bg-yellow-500 text-black px-6 py-3 rounded-2xl font-bold"
                                >
                                    Zobraziť detail
                                </a>
                            </div>
                        </div>
                       ))}
                    </div>
                </div>
            </section>
        </>
    );
}