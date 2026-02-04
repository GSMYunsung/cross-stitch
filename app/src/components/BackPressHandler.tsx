"use client";

import { useEffect } from "react";

export default function BackPressHandler() {
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

  return null;
}
