// Next.js config tuned for GitHub Pages.
//
// Key differences from a normal Next deploy:
//   - `output: 'export'` produces a fully static site in `out/` at build time.
//     GitHub Pages can serve that directory directly. No Node server needed.
//   - `images.unoptimized = true` because Pages can't run the Next image optimizer.
//   - `trailingSlash: true` makes every page emit as `/path/index.html` so Pages
//     URLs work without a server rewriting them.
//   - `basePath` and `assetPrefix` are set when the site lives under
//     `https://<user>.github.io/<repo>/` instead of a custom domain.
//     The deploy workflow injects NEXT_PUBLIC_BASE_PATH at build time.

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
  // Surface basePath to client code (used by Logo's Link href etc.)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
