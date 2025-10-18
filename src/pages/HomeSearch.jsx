import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import TechCard from "../components/TechCard";
import Input from "../components/Input";
import Button from "../components/Button";
import { motion, useReducedMotion } from "framer-motion";

export default function HomeSearch() {
  const r = useReducedMotion();
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [params] = useSearchParams();
  const [searching, setSearching] = useState(false);

  const { data, refetch, isFetching, isError } = useQuery({
    queryKey: ["technicians", city, query],
    queryFn: () => Api.searchTechnicians({ city, q: query }),
    enabled: false,
  });

  const handleSearch = () => {
    setSearching(true);
    refetch().finally(() => setSearching(false));
  };

  useEffect(() => {
    const pCity = params.get("city") || "";
    const pQ = params.get("q") || "";
    if (pCity || pQ) {
      setCity(pCity);
      setQuery(pQ);
      setSearching(true);
      // wait a tick to ensure state applied before refetch closure reads it
      setTimeout(() => {
        refetch().finally(() => setSearching(false));
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 text-center">
        لقَى الحرفي القريب ليك
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto" dir="rtl">
        <Input
          type="text"
          placeholder="مثال: كهربائي"
          className="flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Input
          type="text"
          placeholder="المدينة"
          className="sm:w-44"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={isFetching} className="whitespace-nowrap">
          {isFetching ? "جارٍ البحث..." : "بحث"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isError && (
          <p className="text-center text-red-600">وقع خطأ فالبحث. حاول مرة أخرى.</p>
        )}
        {isFetching && (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </>
        )}
        {!isFetching && data?.length === 0 && searching === false && (
          <p className="text-center text-gray-500 col-span-full">ما كاين حتى تقني بهذ المواصفات.</p>
        )}
        {!isFetching && data?.map((t, i) => (
          <motion.div
            key={t.id}
            initial={r ? false : { opacity: 0, y: 8 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <TechCard t={t} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
