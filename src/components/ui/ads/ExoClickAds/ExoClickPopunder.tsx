"use client";

import Script from "next/script";

interface ExoClickPopunderProps {
  desktopZoneId: string;
  mobileZoneId: string;
}

export default function ExoClickPopunder({ desktopZoneId, mobileZoneId }: ExoClickPopunderProps) {
  // We write the config as a raw string so Next.js can inject it directly into the HTML
  // exactly when the page loads, guaranteeing it is ready before ExoClick arrives.
  const inlineScript = `
    var isMobile = window.innerWidth <= 768;
    var activeZone = isMobile ? "${mobileZoneId}" : "${desktopZoneId}";
    
    window.adConfig = {
      ads_host: "a.pemsrv.com",
      syndication_host: "s.pemsrv.com",
      idzone: parseInt(activeZone, 10),
      popup_fallback: false,
      popup_force: false,
      chrome_enabled: true,
      new_tab: false,
      frequency_period: 60, // Shows 1 popunder per hour per user
      frequency_count: 1,
      trigger_method: 1, // 1 = Click anywhere on page
      trigger_class: "",
      trigger_delay: 0,
      capping_enabled: true,
      tcf_enabled: true,
      agego_cross_site_enabled: true,
      only_inline: false
    };
  `;

  return (
    <>
      {/* 1. Inject the config immediately */}
      <Script id="exo-popunder-config" strategy="afterInteractive">
        {inlineScript}
      </Script>

      {/* 2. Fetch the popunder logic AFTER the config is set */}
      <Script
        id="exoclick-popunder-loader"
        src="//a.pemsrv.com/popunder1000.js"
        strategy="afterInteractive"
      />
    </>
  );
}