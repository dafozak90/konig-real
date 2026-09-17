export default function ContactPage() {
    return (
        <div>
            <main className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-bold mb-8">
                    Kontaktujte nás
                </h1>

                <div className="grid md:grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            KÖNIG REAL, s.r.o.
                        </h2>    

                        <p className="mb-3">
                            📍 Bratislava, Slovensko
                        </p>
                        <a
                            href="tel:+421908131522"
                            className="block text-yellow-600 font-semibold hover:underline"
                        >
                            📱 +421 908 131 522
                        </a>
                        <a
                            href="tel:+421905556810"
                            className="block text-yellow-600 font-semibold hover:underline"
                        >
                            📱 +421 905 556 810
                        </a>
                        <a
                            href="mailto:konig@konig-real.sk"
                            className="block text-yellow-600 font-semibold hover:underline"
                        >
                            ✉️ konig@konig-real.sk
                        </a>
                    </div>

                    <form className="space-y-4">
                        <input
                            type="text"
                            placeholder="Meno a priezvisko"
                            className="w-full border p-3 rounded-xl"
                        />
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="w-full border p-3 rounded-xl"
                        />

                        <input
                            type="tel"
                            placeholder="Telefón"
                            className="w-full border p-3 rounded-xl"
                        />

                        <textarea
                            placeholder="Vaša správa"
                            rows={5}
                            className="w-full border p-3 rounded-xl"    

                        />

                        <button
                           type="submit"
                           className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold"
                        >
                            Odoslať správu
                        </button>       
                    </form>
                </div>
            </main>
        </div>
    );
}