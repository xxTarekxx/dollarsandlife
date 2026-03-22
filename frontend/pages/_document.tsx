import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

const SUPPORTED_LANGS = new Set([
  'es', 'de', 'ja', 'fr', 'pt', 'ru', 'it', 'nl', 'pl', 'tr',
  'fa', 'zh', 'vi', 'id', 'cs', 'ko', 'uk', 'hu', 'ar',
]);

interface MyDocumentProps extends DocumentInitialProps {
  lang: string;
}

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      // Detect language from URL path — e.g. /ar/breaking-news/slug → 'ar'
      const pathname = ctx.asPath || '';
      const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
      const lang = SUPPORTED_LANGS.has(firstSegment) ? firstSegment : 'en';

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
        lang,
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang={this.props.lang || 'en'}>
        <Head>
          {/* Google Fonts preconnect + stylesheet */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap'
          />
          {/* Google tag (gtag.js) */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-S7FWNHSD7P"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-S7FWNHSD7P');
              `,
            }}
          />
          {/* AdSense: plain script avoids Next.js data-nscript attribute (AdSense rejects it) */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1079721341426198"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
