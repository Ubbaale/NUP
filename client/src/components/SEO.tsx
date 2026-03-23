import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

const SITE_NAME = "NUP Diaspora - National Unity Platform";
const DEFAULT_DESCRIPTION = "National Unity Platform (NUP) Diaspora connects Ugandans worldwide in the fight for democracy, freedom, and good governance. Join People Power chapters across the globe, support our campaigns, attend conventions, and be part of the movement for a better Uganda.";
const DEFAULT_KEYWORDS = "NUP, National Unity Platform, People Power, Bobi Wine, Uganda, Ugandan diaspora, NUP diaspora, Uganda politics, Uganda democracy, Uganda opposition, People Power movement, NUP chapters, Uganda elections, free Uganda, Ugandan community, NUP membership, Uganda human rights, Africa democracy, NUP convention, Uganda advocacy, Ugandan abroad, NUP store, Uganda donations, protest vote, Uganda freedom";
const DEFAULT_IMAGE = "/og-image.png";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <link rel="canonical" href={url || window.location.href} />
    </Helmet>
  );
}
