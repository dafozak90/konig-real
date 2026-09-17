"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [status, setStatus] = useState("Na predaj");

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function checkSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await loadProperties();
  }

  setIsLoggedIn(Boolean(session));
  setCheckingSession(false);
}

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
  async (_event, session) => {

    if (session) {
      await loadProperties();
    }

    setIsLoggedIn(Boolean(session));
    setCheckingSession(false);
  }
);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoginLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setErrorMessage(
        `Prihlásenie zlyhalo: ${error.message}`
      );

      setLoginLoading(false);
      return;
    }

    setPassword("");
    setStatusMessage("Prihlásenie bolo úspešné.");
    setLoginLoading(false);
  }

  async function handleLogout() {
    setErrorMessage("");
    setStatusMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(
        `Odhlásenie zlyhalo: ${error.message}`
      );

      return;
    }

    setStatusMessage("Boli ste odhlásený.");
  }

  function handleFilesChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    const validFiles = selectedFiles.filter((file) => {
      return file.type.startsWith("image/");
    });

    setFiles(validFiles);

    setPreviewUrls(
      validFiles.map((file) => {
        return URL.createObjectURL(file);
      })
    );
  }

  function removePhoto(indexToRemove: number) {
    URL.revokeObjectURL(
      previewUrls[indexToRemove]
    );

    setFiles((currentFiles) => {
      return currentFiles.filter(
        (_, index) => index !== indexToRemove
      );
    });

    setPreviewUrls((currentUrls) => {
      return currentUrls.filter(
        (_, index) => index !== indexToRemove
      );
    });
  }

  function movePhoto(
    currentIndex: number,
    direction: "left" | "right"
  ) {
    const newIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      newIndex < 0 ||
      newIndex >= files.length
    ) {
      return;
    }

    const updatedFiles = [...files];
    const updatedPreviews = [...previewUrls];

    [
      updatedFiles[currentIndex],
      updatedFiles[newIndex],
    ] = [
      updatedFiles[newIndex],
      updatedFiles[currentIndex],
    ];

    [
      updatedPreviews[currentIndex],
      updatedPreviews[newIndex],
    ] = [
      updatedPreviews[newIndex],
      updatedPreviews[currentIndex],
    ];

    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  }

  function createSafeFileName(
    fileName: string
  ) {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function createPropertyFolder(
    propertyTitle: string
  ) {
    const safeTitle = propertyTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return `${Date.now()}-${
      safeTitle || "nehnutelnost"
    }`;
  }

  async function uploadPhotos() {
    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];

    const propertyFolder =
      createPropertyFolder(title);

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        const safeFileName =
          createSafeFileName(file.name);

        const randomPart =
          crypto.randomUUID();

        const filePath =
          `${propertyFolder}/` +
          `${index + 1}-${randomPart}-${safeFileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("property-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(filePath);

        const { data: publicUrlData } =
          supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);

        uploadedUrls.push(
          publicUrlData.publicUrl
        );
      }

      return {
        uploadedUrls,
        uploadedPaths,
      };
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("property-images")
          .remove(uploadedPaths);
      }

      throw error;
    }
  }

  async function loadProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (!error && data) {
    setProperties(data);
  }
}

    async function deleteProperty(propertyId: number) {

  const confirmed = window.confirm(
    "Naozaj chcete vymazať túto nehnuteľnosť?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadProperties();
}


  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setLocation("");
    setArea("");
    setRooms("");
    setStatus("Na predaj");
    setFiles([]);
    

    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setPreviewUrls([]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Zadajte názov nehnuteľnosti."
      );

      setSaving(false);
      return;
    }

    if (!location.trim()) {
      setErrorMessage("Zadajte lokalitu.");
      setSaving(false);
      return;
    }

    if (!price || Number(price) < 0) {
      setErrorMessage(
        "Zadajte správnu cenu."
      );

      setSaving(false);
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        "Zadajte popis nehnuteľnosti."
      );

      setSaving(false);
      return;
    }

  if (!editingId && files.length === 0) {
  setErrorMessage(
    "Vyberte aspoň jednu fotografiu."
  );

  setSaving(false);
  return;
}

    let uploadedPaths: string[] = [];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Nie ste prihlásený. Prihláste sa znova."
        );
      }

      const uploadResult =
        await uploadPhotos();

      const uploadedUrls =
        uploadResult.uploadedUrls;

      uploadedPaths =
        uploadResult.uploadedPaths;

      let insertedProperty;
let insertError;

if (editingId) {

  const result = await supabase
    .from("properties")
    .update({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      area: area ? Number(area) : null,
      rooms: rooms ? Number(rooms) : null,
      status,
      image_url: uploadedUrls[0],
    })
    .eq("id", editingId)
    .select("id")
    .single();

  insertedProperty = result.data;
  insertError = result.error;

} else {

  const result = await supabase
    .from("properties")
    .insert([
      {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        area: area ? Number(area) : null,
        rooms: rooms ? Number(rooms) : null,
        status,
        image_url: uploadedUrls[0],
      },
    ])
    .select("id")
    .single();

  insertedProperty = result.data;
  insertError = result.error;
}

      if (insertError) {
        throw insertError;
      }

      if (!insertedProperty) {
        throw new Error(
          "Nehnuteľnosť sa uložila bez identifikátora."
        );
      }

      const galleryRows =
        uploadedUrls.map(
          (imageUrl, index) => ({
            property_id:
              insertedProperty.id,
            image_url: imageUrl,
            position: index,
          })
        );

      const { error: galleryError } =
        await supabase
          .from("property_images")
          .insert(galleryRows);

      if (galleryError) {
        await supabase
          .from("properties")
          .delete()
          .eq(
            "id",
            insertedProperty.id
          );

        throw galleryError;
      }

      setStatusMessage(
        "Nehnuteľnosť aj fotografie boli úspešne uložené."
      );

      resetForm();
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("property-images")
          .remove(uploadedPaths);
      }

      const message =
        error instanceof Error
          ? error.message
          : "Pri ukladaní nastala neznáma chyba.";

      setErrorMessage(`Uloženie zlyhalo: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-lg font-semibold">
          Kontrolujem prihlásenie...
        </p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8">
          <h1 className="text-4xl font-bold mb-3">
            Administrácia
          </h1>

          <p className="text-gray-600 mb-8">
            Prihláste sa do administrácie
            KÖNIG REAL.
          </p>

          {errorMessage && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
              {statusMessage}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-semibold"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="admin@konig-real.sk"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-semibold"
              >
                Heslo
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Vaše heslo"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 px-6 py-3 rounded-xl font-bold transition-colors"
            >
              {loginLoading
                ? "Prihlasujem..."
                : "Prihlásiť sa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Administrácia
            </h1>

            <p className="text-gray-600 mt-2">
              Pridanie novej nehnuteľnosti
              a fotografií
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="border border-gray-300 bg-white hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold"
          >
            Odhlásiť sa
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            {statusMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-3xl p-6 md:p-10 space-y-7"
        >
          <div>
            <label
              htmlFor="title"
              className="block mb-2 font-semibold"
            >
              Názov nehnuteľnosti *
            </label>

            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(event) => {
                setTitle(
                  event.target.value
                );
              }}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Napríklad 3-izbový byt v centre Pezinka"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="location"
                className="block mb-2 font-semibold"
              >
                Lokalita *
              </label>

              <input
                id="location"
                type="text"
                required
                value={location}
                onChange={(event) => {
                  setLocation(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Pezinok"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block mb-2 font-semibold"
              >
                Cena v eurách *
              </label>

              <input
                id="price"
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(event) => {
                  setPrice(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="199900"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="area"
                className="block mb-2 font-semibold"
              >
                Rozloha v m²
              </label>

              <input
                id="area"
                type="number"
                min="0"
                step="0.01"
                value={area}
                onChange={(event) => {
                  setArea(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="78"
              />
            </div>

            <div>
              <label
                htmlFor="rooms"
                className="block mb-2 font-semibold"
              >
                Počet izieb
              </label>

              <input
                id="rooms"
                type="number"
                min="0"
                step="1"
                value={rooms}
                onChange={(event) => {
                  setRooms(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="3"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block mb-2 font-semibold"
              >
                Stav ponuky
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target.value
                  );
                }}
                className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Na predaj">
                  Na predaj
                </option>

                <option value="Na prenájom">
                  Na prenájom
                </option>

                <option value="Rezervované">
                  Rezervované
                </option>

                <option value="Predané">
                  Predané
                </option>

                <option value="Prenajaté">
                  Prenajaté
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 font-semibold"
            >
              Popis nehnuteľnosti *
            </label>

            <textarea
              id="description"
              required
              rows={9}
              value={description}
              onChange={(event) => {
                setDescription(
                  event.target.value
                );
              }}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Napíšte podrobný popis nehnuteľnosti..."
            />
          </div>

          <div>
            <label
              htmlFor="photos"
              className="block mb-2 font-semibold"
            >
              Fotografie *
            </label>

            <p className="text-sm text-gray-500 mb-3">
              Označte viac fotografií
              naraz. Prvá fotografia bude
              hlavná fotografia ponuky.
            </p>

            <input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required={!editingId && files.length === 0}
              onChange={handleFilesChange}
              className="block w-full border border-gray-300 rounded-xl p-3 bg-white"
            />

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {previewUrls.map(
                  (previewUrl, index) => (
                    <div
                      key={previewUrl}
                      className="overflow-hidden rounded-xl border bg-gray-100"
                    >
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt={`Náhľad fotografie ${
                            index + 1
                          }`}
                          className="w-full h-44 object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                            Hlavná fotografia
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 p-3 bg-white">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            movePhoto(
                              index,
                              "left"
                            );
                          }}
                          className="border px-3 py-2 rounded-lg text-sm disabled:opacity-30"
                        >
                          Doľava
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            previewUrls.length - 1
                          }
                          onClick={() => {
                            movePhoto(
                              index,
                              "right"
                            );
                          }}
                          className="border px-3 py-2 rounded-lg text-sm disabled:opacity-30"
                        >
                          Doprava
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            removePhoto(index);
                          }}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Odstrániť
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-10 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            {saving
              ? "Ukladám nehnuteľnosť a fotografie..."
              : "Uložiť nehnuteľnosť"}
          </button>
        </form>
        <div className="mt-12">
  <h2 className="text-3xl font-bold mb-6">
    Aktuálne nehnuteľnosti
  </h2>

  <div className="grid md:grid-cols-2 gap-6">
    {properties.map((property) => (
      <div
        key={property.id}
        className="bg-white rounded-2xl shadow p-5"
      >
        {property.image_url && (
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}

        <h3 className="text-xl font-bold">
          {property.title}
        </h3>

        <p className="text-gray-500">
          {property.location}
        </p>

        <p className="text-yellow-600 text-2xl font-bold mt-2">
          {Number(property.price).toLocaleString("sk-SK")} €
        </p>

        <p className="mt-2">
          {property.status}
        </p>
        <div className="mt-4 flex gap-2">

  <button
    type="button"
    onClick={() => {
      setEditingId(property.id);

      setTitle(property.title || "");
      setDescription(property.description || "");
      setPrice(String(property.price || ""));
      setLocation(property.location || "");
      setArea(String(property.area || ""));
      setRooms(String(property.rooms || ""));
      setStatus(property.status || "Na predaj");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }}
    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
  >
    Upraviť
  </button>

  <button
    type="button"
    onClick={() => deleteProperty(property.id)}
    className="bg-red-600 text-white px-4 py-2 rounded-xl"
  >
    Vymazať
  </button>

</div>
      </div>
    ))}
  </div>
</div>
      </div>
    </main>
  );
}