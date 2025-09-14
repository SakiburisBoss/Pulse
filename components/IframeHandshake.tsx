"use client";

import { useEffect } from "react";

export default function IframeHandshake() {
  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage("iframe-ready", window.location.origin);
    }
  }, []);

  return null; // nothing to render
}
