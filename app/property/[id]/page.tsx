export const dynamic = "force-dynamic";
import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";

export default async function PropertyDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) { 
     const { id } = await params;

     const { data: property, error } = await supabase   
     .from("properties")
     .select("*")
     .eq("id", Number(id))
     .single();
     const { data: gallery } = await supabase
     .from("property_images")
     .select("*")
     .eq("property_id", Number(id))
     .order("position");

 if (error) {
    return <div>Chyba: {error.message}</div>;
 }

 if (!property) {
    return <div>Nehnuteľnosť nebola nájdená</div>; 
 }  

 return (
    <main className="max-w-6xl mx-auto p-8">
       <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-[500px] object-cover rounded-3xl shadow-lg"
                />

                {gallery && gallery.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {gallery.map((image) => (
                            <img
                                key={image.id}
                                src={image.image_url}
                                alt={property.title}
                                className="w-full h-48 object-cover rounded-xl"
                            />
                        ))}
                    </div>
                )}

       <div className="mt-8">
            <h1 className="text-5xl font-bold"> 
                {property.title}
            </h1>

            <p className="text-xl text-gray-500 mt-2">
               {property.location}   
            </p>

            <p className="text-4xl font-bold text-yellow-600 mt-6">
                {Number(property.price).toLocaleString("sk-SK")} €
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gray-100 p-4 rounded-xl">
                   <strong>Rozloha</strong>
                    <p>{property.area || "-"} m²</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                    <strong>Izby</strong>
                    <p>{property.rooms || "-"}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                    <strong>Status</strong>
                    <p>{property.status || "-"}</p>
                </div>
            </div>

            <div className="mt-10">
                <h2 className="text-3xl font-bold mb-4">
                   Popis nehnuteľnosti 
                </h2>

                <p className="text-lg text-gray-700">
                    {property.description ||
                    "Popis zatiaľ nebol zadaný."}
                </p>
            </div>
        </div>    
    </main>
  );
}  
