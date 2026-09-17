export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default async function PropertiesPage() {
    const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

    if (error) {
        return <div>Chyba: {error.message}</div>;
    }
    return (
2
<pre>
3
{JSON.stringify(properties, null, 2)}
4
</pre>
5
);

    return (
        <main className="max-w-6xl mx-auto p-8">
            <h1 className="text-5xl font-bold mb-10">Nehnuteľnosti</h1>
            <p className="text-lg text-gray-600 mb-10">Všetky nehnuteľnosti</p>
            <div className="grid md:grid-cols-3 gap-8">
                {properties?.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden"
                    >
                        <img
                            src={property.image_url}
                            alt={property.title}
                            className="w-full h-56 object-cover"
                        />

                        <div className="p-6">
                            <h2 className="text-2xl font-semibold">
                                {property.title}
                            </h2>

                            <p className="text-gray-500 mt-2">
                                {property.location}
                            </p>

                            <p className="text-yellow-600 text-3xl font-bold mt-4">
                                {Number(property.price).toLocaleString("sk-SK")} €      
                            </p>

                            <Link
                                href={`/property/${property.id}`}
                                className="inline-block mt-6 bg-yellow-500 px-5 py-3 rounded-xl font-semibold"
                            >
                                Zobraziť detail
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}