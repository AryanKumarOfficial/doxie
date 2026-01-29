import { Organization, WebApplication, WithContext } from "schema-dts";

interface JsonLdProps {
  type: "Organization" | "WebApplication";
  data?: any;
}

export default function JsonLd({ type, data = {} }: JsonLdProps) {
  let jsonLd: WithContext<Organization | WebApplication>;

  if (type === "Organization") {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",      name: "Doxie",
      url: "https://doxie.vercel.app",
      logo: "https://doxie.vercel.app/logo.png",
      sameAs: [
        "https://twitter.com/doxieapp",
        "https://github.com/doxieapp",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@doxie.vercel.app",
        contactType: "customer service",
      },
      ...data,
    };
  } else if (type === "WebApplication") {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Doxie",
      applicationCategory: "ProductivityApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      description:
        "Take notes beautifully, organize effortlessly, collaborate seamlessly with Doxie.",
      ...data,
    };
  } else {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
