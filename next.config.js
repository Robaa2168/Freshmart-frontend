// next.config.js
const runtimeCaching = require("next-pwa/cache")
const nextTranslate = require("next-translate-plugin")

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})

module.exports = withPWA(
  nextTranslate({
    reactStrictMode: true,

    turbopack: {},

    experimental: {
      legacyNextLink: true,
    },

    i18n: {
      locales: ["en", "de", "fr", "nl-NL"],
      defaultLocale: "en",
      domains: [
        { domain: "example.com", defaultLocale: "en", locales: ["de"] },
        { domain: "example.nl", defaultLocale: "nl-NL" },
        { domain: "example.fr", defaultLocale: "fr" },
      ],
    },

    images: {
      remotePatterns: [
        { protocol: "https", hostname: "freshmart-plum.vercel.app" },
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "img.icons8.com" },
        { protocol: "https", hostname: "i.ibb.co" },
        { protocol: "https", hostname: "i.postimg.cc" },
        { protocol: "https", hostname: "fakestoreapi.com" },
        { protocol: "https", hostname: "res.cloudinary.com" },
        { protocol: "https", hostname: "lh3.googleusercontent.com" },
        { protocol: "https", hostname: "images.dashter.com" },
      ],
    },
  })
)
