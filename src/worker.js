/**
 * Cloudflare Worker — Static Assets serving for serviceparadigm.com
 *
 * Serves the built Astro site from ./dist as static assets.
 * Falls through to the ASSETS binding for all unmatched requests.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
