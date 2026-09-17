export const dynamic = "force-dynamic";
import { supabase } from "../../lib/supabase";

export default async function TestPage() {
    const { data, error } = await supabase
    .from("properties")
    .select("*")

    return (
        <main className="p-10">
            <h1>Test databázy</h1>

            <p>
              Počet záznamov: {data?.length ?? 0}  
            </p>

            <pre>{JSON.stringify(data, null, 2)}</pre>

            <pre>{JSON.stringify(error, null, 2)}</pre>
        </main>
     );   
}     