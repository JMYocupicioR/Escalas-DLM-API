import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Root HTML template for Expo Router web builds.
 * We inject a global CSS override here to fix the React Navigation
 * tab bar clipping issue on mobile web viewports.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Reset scroll styles for RN web */}
        <ScrollViewStyleReset />
        {/* Fix React Navigation tab bar label clipping on mobile web */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Tab bar container — ensure it's tall enough for icon + label */
          [data-testid="tab-bar"],
          div[style*="bottom: 0"][style*="position: fixed"],
          div[style*="bottom: 0px"][style*="position: fixed"] {
            overflow: visible !important;
          }

          /* Tab bar items — allow content to overflow (labels below icons) */
          div[style*="flex: 1"][style*="align-items: center"][style*="justify-content: center"] {
            overflow: visible !important;
          }

          /* Force the tab bar inner wrapper to show labels */
          div[role="tablist"] {
            height: 60px !important;
            padding-bottom: 8px !important;
            padding-top: 6px !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }

          div[role="tab"] {
            overflow: visible !important;
            height: 100% !important;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
