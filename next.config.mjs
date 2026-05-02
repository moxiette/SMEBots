// Next.js config tuned for GitHub Pages.
//
// Key differences from a normal Next deploy:
//   - `output: 'export'` produces a fully static site in `out/` at build time.
//   - `images.unoptimized = true` because Pages can't run the Next image optimizer.
//   - `trailingSlash: true` makes URLs Pages-friendly without a rewriting server.
//   - `basePath` / `assetPrefix` injected at build time via NEXT_PUBLIC_BASE_PATH.
//
// IMPORTANT — chunk consolidation for corporate-GHE web-upload deploys:
// When the built `out/` directory has to be uploaded via GitHub's web UI
// (because corporate GHE blocks GitHub-hosted Actions runners and we deploy
// via "Deploy from a branch" instead), the web upload caps at ~100 files
// per commit. Default Next.js chunking produces 50-100+ small JS chunks
// which can exceed that cap. The webpack override below collapses chunks
// into a much smaller number of larger files (typically 5-10 total) so
// the entire built site fits comfortably in a single drag-and-drop commit.

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
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  webpack: (config, { dev, isServer }) => {
    // Only adjust client-side production builds.
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        // Cap each chunk at ~450KB so corporate proxies (which often
        // reject or deep-inspect files >1MB) don't block the upload.
        // ExcelJS, docx, framer-motion, etc. get split across several
        // medium-sized files instead of bundled into one large file.
        maxSize: 450_000,
        minSize: 20_000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            priority: 40,
            chunks: "all",
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            chunks: "all",
            // Don't pin to a single name — let webpack split into
            // multiple lib-*.js files if total exceeds maxSize.
            name(module) {
              const match = module.context?.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              );
              const pkg = match ? match[1].replace("@", "").replace("/", "-") : "vendor";
              return `lib-${pkg}`;
            },
            reuseExistingChunk: true,
          },
          shared: {
            name: "shared",
            minChunks: 2,
            priority: 20,
            chunks: "all",
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
