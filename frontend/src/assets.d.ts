// frontend/src/assets.d.ts

// For CSS modules (if you use them, e.g., styles.module.css)
// declare module '*.module.css' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }

// For SCSS modules (if you use them)
// declare module '*.module.scss' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }

// Image file types - these ensure TypeScript understands the import as a string (URL)
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const content: string; // For Vite, importing an SVG typically gives its URL path.
  export default content;
  // If you are using vite-plugin-svgr or similar to import SVGs as React components:
  // import * as React from 'react';
  // export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  // const src: string;
  // export default src;
}