import type { NextConfig } from 'next';

const watchNodeModules = true;

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
   // webpack: (config, { isServer, nextRuntime }) => {
   //   if (watchNodeModules) {
   //       // It's recommended to opt-out of managedPaths if editing files in
   //         // node_modules directly.
   //           // @see https://github.com/webpack/webpack/issues/11612#issuecomment-705790881
   //             // @see https://webpack.js.org/configuration/other-options/#managedpaths
   //               config.snapshot.managedPaths = [];
   //
   //         // config.watchOptions isn't directly writable, so we use defineProperty.
   //           Object.defineProperty(config, "watchOptions", {
   //               ...Object.getOwnPropertyDescriptor(config, "watchOptions"),
   //           value: {
   //             ...config.watchOptions,
   //               ignored:
   //               /^((?:[^/]*(?:\/|$))*)(\.(git|next))(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/,
   //             },
   //       });
   //
   //         // This seems to work without any changes to watchOptions.followSymlinks
   //           // or resolve.symlinks, but in case it ever becomes relevant:
   //             // @see https://github.com/webpack/webpack/issues/11612#issuecomment-1448208868
   //             }
   //
   //     return config;
   // },
};

export default nextConfig;
