import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from "firebase/analytics";

// Firebase web config is public by design — these values ship in the client
// bundle and are safe to commit (Firebase security is enforced by rules, not by
// hiding this config). Keep in sync with the Firebase console → Project settings.
const firebaseConfig = {
  apiKey: "AIzaSyD7h63EwKJiWLM_1hBCxo_jkcAKg1qEsIY",
  authDomain: "dermodel-478616.firebaseapp.com",
  projectId: "dermodel-478616",
  storageBucket: "dermodel-478616.firebasestorage.app",
  messagingSenderId: "874945195310",
  appId: "1:874945195310:web:c7ef4cd439f8ea56ad1ebf",
  measurementId: "G-F2MVXN482T",
};

export const firebaseApp = initializeApp(firebaseConfig);

// getAnalytics() throws outside a supported browser environment (SSR, some
// embedded webviews, or when the measurement APIs are blocked), so gate it on
// isSupported() and never let analytics failures break app startup.
let analytics: Analytics | null = null;

export const analyticsReady: Promise<Analytics | null> = isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
    return analytics;
  })
  .catch(() => null);

export { analytics };

// Manually record a GA4 page_view. Needed because this is a client-routed SPA:
// GA4's automatic page_view only fires on the initial document load, not on
// React Router navigations. Awaits analyticsReady so calls made before
// isSupported() resolves are not dropped.
export async function logPageView(path: string, title?: string): Promise<void> {
  const instance = await analyticsReady;
  if (!instance) return;
  logEvent(instance, "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title ?? document.title,
  });
}
