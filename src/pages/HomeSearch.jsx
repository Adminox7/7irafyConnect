import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function HomeSearch() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["technicians", city, query],
    queryFn: async () => {
      const res = await axios.get("/api/v1/technicians", {
        params: { city, q: query },
      });
      return res.data;
    },
    enabled: false,
  });

  const handleSearch = () => {
    setSearching(true);
    refetch().finally(() => setSearching(false));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 text-center">
        لقَى الحرفي القريب ليك
      </h1>

      <div className="flex gap-3 justify-center">
        <input
          type="text"
          placeholder="مثال: كهربائي"
          className="border px-3 py-2 rounded-md w-1/3 text-right"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="المدينة"
          className="border px-3 py-2 rounded-md w-1/5 text-right"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={isFetching}
          className="bg-[var(--brand)] text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition"
        >
          {isFetching ? "جارٍ البحث..." : "بحث"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.length === 0 && searching === false && (
          <p className="text-center text-gray-500">ما كاين حتى تقني بهذ المواصفات.</p>
        )}
        {data?.map((t) => (
          <div
            key={t.id}
            className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-cyan-700">{t.fullName}</h2>
            <p className="text-sm text-gray-600">{t.city}</p>
            <p className="text-sm mt-2">
              <span className="font-medium">التخصص:</span>{" "}
              {t.specialties?.join(", ")}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">التقييم:</span> ⭐ {t.averageRating}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
