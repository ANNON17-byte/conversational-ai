import { useMutation } from "@tanstack/react-query";
import {
  generateDashboard,
  DashboardRequest,
  DashboardResponse,
} from "@/services/api";

/**
 * React Query mutation hook for the main dashboard generation pipeline.
 * Usage:
 *   const { mutate, data, isPending, error } = useDashboardQuery();
 *   mutate({ query: "Show revenue by region", session_id: null });
 */
export function useDashboardQuery() {
  return useMutation<DashboardResponse, Error, DashboardRequest>({
    mutationFn: generateDashboard,
  });
}
