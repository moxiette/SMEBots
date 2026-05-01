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
    // Only collapse chunks for client-side production builds.
    // Leave dev and server builds alone.
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        // Single shared vendor chunk for everything from node_modules.
        // ExcelJS / docx / framer-motion / react / etc. all land in one
        // file. Larger first download but fewer total files to upload.
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
            name: "lib",
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            chunks: "all",
            enforce: true,
          },
          shared: {
            name: "shared",
            minChunks: 2,
            priority: 20,
            chunks: "all",
            reuseExistingChunk: true,
          },
        },
        // Cap at a small number of chunks to keep file count low.
        maxInitialRequests: 6,
        maxAsyncRequests: 6,
      };
    }
    return config;
  },
};

export default nextConfig;
