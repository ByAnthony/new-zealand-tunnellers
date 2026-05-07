const newRelicSnippet = `
;window.NREUM||(NREUM={});NREUM.init={distributed_tracing:{enabled:true},performance:{capture_measures:true},browser_consent_mode:{enabled:false},privacy:{cookies_enabled:true},ajax:{deny_list:["bam.eu01.nr-data.net"],capture_payloads:"none"}};

;NREUM.loader_config={accountID:"8031957",trustKey:"8031957",agentID:"538849118",licenseKey:"NRJS-b5f5b4e6c48e51a767c",applicationID:"538849118"};
;NREUM.info={beacon:"bam.eu01.nr-data.net",errorBeacon:"bam.eu01.nr-data.net",licenseKey:"NRJS-b5f5b4e6c48e51a767c",applicationID:"538849118",sa:1};
;(function(){var script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://js-agent.newrelic.com/nr-loader-spa-1.314.0.min.js";document.head.appendChild(script);})();
`;

export function NewRelicBrowserAgent() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <script
      id="new-relic-browser-agent"
      type="text/javascript"
      dangerouslySetInnerHTML={{ __html: newRelicSnippet }}
    />
  );
}
