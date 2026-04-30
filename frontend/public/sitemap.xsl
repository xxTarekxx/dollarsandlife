<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Dollars &amp; Life</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f7f5ff; color: #333; padding: 0 0 60px; }
          .header { background: linear-gradient(135deg, #700877 0%, #b0196b 55%, #ff2759 100%); color: #fff; padding: 28px 40px 24px; display: flex; align-items: center; gap: 18px; }
          .header-logo { font-size: 1.7rem; font-weight: 800; letter-spacing: -0.5px; }
          .header-logo span { color: #ffd966; }
          .header-sub { font-size: 0.9rem; opacity: 0.85; margin-top: 3px; }
          .header-right { margin-left: auto; text-align: right; }
          .header-count { font-size: 2rem; font-weight: 700; line-height: 1; }
          .header-count-label { font-size: 0.78rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.06em; }
          .info-bar { background: #fff; border-bottom: 1px solid #e8e0f5; padding: 12px 40px; font-size: 0.82rem; color: #777; }
          .info-bar a { color: #700877; text-decoration: none; }
          .info-bar a:hover { text-decoration: underline; }
          .container { max-width: 1100px; margin: 32px auto 0; padding: 0 20px; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(112,8,119,0.08); }
          thead tr { background: linear-gradient(135deg, #700877 0%, #b0196b 100%); color: #fff; }
          thead th { padding: 13px 18px; text-align: left; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }
          tbody tr { border-bottom: 1px solid #f0eaff; transition: background 0.12s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #faf7ff; }
          tbody td { padding: 11px 18px; font-size: 0.85rem; vertical-align: middle; }
          .url-cell a { color: #700877; text-decoration: none; word-break: break-all; }
          .url-cell a:hover { color: #ff2759; text-decoration: underline; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; background: #f0eaff; color: #700877; }
          .priority-bar-wrap { display: flex; align-items: center; gap: 8px; }
          .priority-bar { flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; min-width: 60px; }
          .priority-bar-fill { height: 100%; background: linear-gradient(90deg, #700877, #ff2759); border-radius: 3px; }
          .priority-val { font-size: 0.8rem; color: #555; min-width: 24px; }
          .lastmod { color: #888; white-space: nowrap; font-size: 0.8rem; }
          @media (max-width: 640px) {
            .header { padding: 20px 16px; } .info-bar { padding: 10px 16px; } .container { padding: 0 10px; }
            thead th:nth-child(3), tbody td:nth-child(3) { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="header-logo">Dollars <span>&amp;</span> Life</div>
            <div class="header-sub">XML Sitemap — indexed pages for search engines</div>
          </div>
          <div class="header-right">
            <div class="header-count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
            <div class="header-count-label">URLs</div>
          </div>
        </div>
        <div class="info-bar">
          This sitemap is intended for search engine crawlers. &#183;
          <a href="https://www.dollarsandlife.com">&#8592; Back to Dollars &amp; Life</a>
        </div>
        <div class="container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td style="color:#aaa;font-size:0.75rem;"><xsl:value-of select="position()"/></td>
                  <td class="url-cell">
                    <a href="{sitemap:loc}" target="_blank" rel="noopener"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td class="lastmod"><xsl:if test="sitemap:lastmod"><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></xsl:if></td>
                  <td><xsl:if test="sitemap:changefreq"><span class="badge"><xsl:value-of select="sitemap:changefreq"/></span></xsl:if></td>
                  <td>
                    <xsl:if test="sitemap:priority">
                      <div class="priority-bar-wrap">
                        <div class="priority-bar">
                          <div class="priority-bar-fill">
                            <xsl:attribute name="style">width: <xsl:value-of select="sitemap:priority * 100"/>%</xsl:attribute>
                          </div>
                        </div>
                        <span class="priority-val"><xsl:value-of select="sitemap:priority"/></span>
                      </div>
                    </xsl:if>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>