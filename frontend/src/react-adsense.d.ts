declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: {
        page_path?: string;
        traffic_type?: string;
        [key: string]: unknown;
      }
    ) => void;
  }
}

declare module 'react-adsense' {
  import { Component } from 'react';
  
  interface AdSenseProps {
    client: string;
    slot: string;
    style?: React.CSSProperties;
    format?: string;
    responsive?: boolean;
    layout?: string;
    layoutKey?: string;
    fullWidthResponsive?: boolean;
  }
  
  export default class AdSense extends Component<AdSenseProps> {}
}
  