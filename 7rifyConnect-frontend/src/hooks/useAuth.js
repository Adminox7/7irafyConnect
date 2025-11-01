import { useQuery } from "@tanstack/react-query";
import { Api } from "@/api/endpoints";

export function useMe(options = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => Api.me(),
    staleTime: 60_000,
    retry: 0,
    ...options,
  });
}
