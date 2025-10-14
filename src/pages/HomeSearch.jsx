import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";
import TechCard from "../components/TechCard";

export default function HomeSearch() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const { data, refetch, isFetching, isError } = useQuery({
    queryKey: ["technicians", city, query],
    queryFn: async () => {
      const res = await http.get("/technicians", {
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
          className="bg-brand text-white px-6 py-2 rounded-md hover:bg-brand-700 transition"
        >
          {isFetching ? "جارٍ البحث..." : "بحث"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isError && (
          <p className="text-center text-red-600">وقع خطأ فالبحث. حاول مرة أخرى.</p>
        )}
        {isFetching && (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />
            ))}
          </>
        )}
        {!isFetching && data?.length === 0 && searching === false && (
          <p className="text-center text-gray-500 col-span-full">ما كاين حتى تقني بهذ المواصفات.</p>
        )}
        {!isFetching && data?.map((t) => (
          <TechCard t={t} key={t.id} />
        ))}
      </div>
    </div>
  );
}
