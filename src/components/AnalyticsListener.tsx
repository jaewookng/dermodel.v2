import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logPageView } from "@/integrations/firebase/config";

/**
 * Fires a GA4 page_view on every client-side route change. Renders nothing.
 * Must live inside <BrowserRouter> so useLocation() is available.
 */
export function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
