declare module 'react-adsense' {
    import * as React from 'react';
  
    interface GoogleAdsenseProps {
      client: string;
      slot: string;
      style?: React.CSSProperties;
      format?: string;
      responsive?: string;
    }
  
    class GoogleAdsense extends React.Component<GoogleAdsenseProps> {}
  
    export = {
      Google: GoogleAdsense
    };
  }
  