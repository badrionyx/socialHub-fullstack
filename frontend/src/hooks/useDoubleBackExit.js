import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Keeps the user on the current page when Back is pressed once, and exits the
// app (leaves SocialHub in the browser history) when Back is pressed twice
// within 2 seconds. In a packaged TWA/Capacitor Android app this same behavior
// makes the OS close the app on the second press.
export default function useDoubleBackExit() {
  const lastBack = useRef(0);

  useEffect(() => {
    // Push a buffer entry so the first Back press has something to pop.
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      const now = Date.now();
      if (now - lastBack.current < 2000) {
        // Second press within the window -> let the app exit.
        window.history.back();
        return;
      }
      lastBack.current = now;
      // Re-push the buffer so we stay on the current page.
      window.history.pushState(null, "", window.location.href);
      toast("Press back again to exit", { icon: "👋" });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
