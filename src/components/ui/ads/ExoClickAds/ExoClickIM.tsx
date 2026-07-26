"use client";

import Script from "next/script";

declare global {
  interface Window {
    AdProvider: any[];
  }
}

interface ExoClickIMProps {
  zoneId?: string;
  className?: string;
}

export default function ExoClickIM({
  zoneId = "5984398",
  className = "",
}: ExoClickIMProps) {
  return (
    <>
      {/* Load ExoClick as late as possible without killing fill rate */}
      <Script
        id={`exoclick-im-${zoneId}`}
        strategy="lazyOnload"
        src="https://a.magsrv.com/ad-provider.js"
        onLoad={() => {
          try {
            (window.AdProvider = window.AdProvider || []).push({ serve: {} });
          } catch {
            // silent fail
          }
        }}
      />

      {/* 
        Wrapper that isolates the ad from the main document flow.
        This significantly reduces CLS caused by ExoClick injecting 
        the floating chat-style unit.
      */}
      <div
        className={`exo-im-root ${className}`}
        style={{
          position: "relative",
          zIndex: 9999,
          // Prevent the injected unit from pushing content
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <ins
            className="eas6a97888e6"
            data-zoneid={zoneId}
            style={{ display: "block" }}
          />
        </div>
      </div>
    </>
  );
}