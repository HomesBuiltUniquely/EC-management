import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Next ships webpack; use IgnorePlugin to keep Node-only code out of Edge.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { webpack } = require("next/dist/compiled/webpack/webpack") as { webpack: any };

const nextConfig: NextConfig = {
    serverExternalPackages: ["mysql2"],
    webpack: (config, { nextRuntime }) => {
        // Only the Node.js instrumentation compile may load mysql/fs.
        if (nextRuntime !== "nodejs") {
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /instrumentation\.node/,
                })
            );
            config.resolve.alias = {
                ...config.resolve.alias,
                [path.resolve(process.cwd(), "instrumentation.node")]: false,
                [path.resolve(process.cwd(), "instrumentation.node.ts")]: false,
            };
        }
        return config;
    },
};

export default nextConfig;
