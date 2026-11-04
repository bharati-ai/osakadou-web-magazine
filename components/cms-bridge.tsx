"use client";

import { useEffect } from "react";

/**
 * Visual-editor hook-up. Does nothing for visitors: it only loads the bridge when this page is
 * framed by the same-origin admin with ?cms-edit=<page>.
 */
export function CmsBridge() {
  useEffect(() => {
    const page = new URLSearchParams(location.search).get("cms-edit");
    if (!page || !/^[a-z]+$/.test(page) || window.parent === window) return;
    try {
      if (window.parent.location.origin !== location.origin) return;
    } catch {
      return;
    }
    let stop: (() => void) | undefined;
    let off = false;
    import("./cms-bridge-impl").then((m) => { if (!off) stop = m.start(page); });
    return () => { off = true; stop?.(); };
  }, []);
  return null;
}

/** True inside the visual editor's canvas (used to pause autoplay etc.). */
export const inCmsEdit = () => typeof location !== "undefined" && new URLSearchParams(location.search).has("cms-edit");
