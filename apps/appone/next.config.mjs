import createNextIntlPlugin from 'next-intl/plugin';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
    additionalData: `@use "${path.join(process.cwd(), 'styles/_mantine').replace(/\\/g, '/')}" as mantine;`,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/': ['node_modules/@nartix/next-middleware-chain/**/*', 'node_modules/@nartix/next-security/**/*', '../../packages/**/*'],
  },
};

export default withNextIntl(nextConfig);
