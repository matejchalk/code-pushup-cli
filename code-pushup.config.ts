import 'dotenv/config';
import { join } from 'node:path';
import { z } from 'zod';
import {
  // LIGHTHOUSE_OUTPUT_FILE_DEFAULT,
  fileSizePlugin,
  fileSizeRecommendedRefs,
  knipCategoryGroupRef,
  knipPlugin,
  packageJsonDocumentationGroupRef, // lighthousePlugin, lighthouseCorePerfGroupRefs,
  packageJsonPerformanceGroupRef,
  packageJsonPlugin,
} from './dist/examples/plugins';
import coveragePlugin, {
  getNxCoveragePaths,
} from './dist/packages/plugin-coverage';
import eslintPlugin, {
  eslintConfigFromNxProjects,
} from './dist/packages/plugin-eslint';
import jsPackagesPlugin from './dist/packages/plugin-js-packages';
import {
  KNIP_PLUGIN_SLUG,
  KNIP_RAW_REPORT_NAME,
  KNIP_REPORT_NAME,
} from './examples/plugins/src/knip/src/constants';
import type { CoreConfig } from './packages/models/src';

// load upload configuration from environment
const envSchema = z
  .object({
    CP_SERVER: z.string().url(),
    CP_API_KEY: z.string().min(1),
    CP_ORGANIZATION: z.string().min(1),
    CP_PROJECT: z.string().min(1),
  })
  .partial();
const env = await envSchema.parseAsync(process.env);

const config: CoreConfig = {
  ...(env.CP_SERVER &&
    env.CP_API_KEY &&
    env.CP_ORGANIZATION &&
    env.CP_PROJECT && {
      upload: {
        server: env.CP_SERVER,
        apiKey: env.CP_API_KEY,
        organization: env.CP_ORGANIZATION,
        project: env.CP_PROJECT,
      },
    }),

  plugins: [
    await eslintPlugin(await eslintConfigFromNxProjects()),

    await coveragePlugin({
      coverageToolCommand: {
        command: 'npx',
        args: [
          'nx',
          'run-many',
          '-t',
          'unit-test',
          'integration-test',
          '--coverage.enabled',
          '--skipNxCache',
        ],
      },
      reports: await getNxCoveragePaths(['unit-test', 'integration-test']),
    }),

    await jsPackagesPlugin({ packageManager: 'npm' }),

    fileSizePlugin({
      directory: './dist/examples/react-todos-app',
      pattern: /\.js$/,
      budget: 174_080, // 170 kB
    }),

    packageJsonPlugin({
      directory: './dist/packages',
      license: 'MIT',
      type: 'module',
    }),

    // see https://github.com/code-pushup/cli/issues/538
    // await lighthousePlugin({
    //   url: 'https://staging.code-pushup.dev/login',
    //   outputPath: join('.code-pushup', LIGHTHOUSE_OUTPUT_FILE_DEFAULT),
    //   headless: true,
    // }),

    await knipPlugin({
      rawOutputFile: join(
        '.code-pushup',
        KNIP_PLUGIN_SLUG,
        `${KNIP_RAW_REPORT_NAME.split('.').shift()}-${Date.now()}.json`,
      ),
      outputFile: join(
        '.code-pushup',
        KNIP_PLUGIN_SLUG,
        `${KNIP_REPORT_NAME.split('.').shift()}-${Date.now()}.json`,
      ),
    }),
  ],

  categories: [
    {
      slug: 'bug-prevention',
      title: 'Bug prevention',
      description: 'Lint rules that find **potential bugs** in your code.',
      refs: [{ type: 'group', plugin: 'eslint', slug: 'problems', weight: 1 }],
    },
    {
      slug: 'code-style',
      title: 'Code style',
      description:
        'Lint rules that promote **good practices** and consistency in your code.',
      refs: [
        { type: 'group', plugin: 'eslint', slug: 'suggestions', weight: 1 },
      ],
    },
    {
      slug: 'code-coverage',
      title: 'Code coverage',
      description: 'Measures how much of your code is **covered by tests**.',
      refs: [
        {
          type: 'group',
          plugin: 'coverage',
          slug: 'coverage',
          weight: 1,
        },
      ],
    },
    {
      slug: 'security',
      title: 'Security',
      description: 'Finds known **vulnerabilities** in 3rd-party packages.',
      refs: [
        {
          type: 'group',
          plugin: 'js-packages',
          slug: 'npm-audit',
          weight: 1,
        },
      ],
    },
    {
      slug: 'updates',
      title: 'Updates',
      description: 'Finds **outdated** 3rd-party packages.',
      refs: [
        {
          type: 'group',
          plugin: 'js-packages',
          slug: 'npm-outdated',
          weight: 1,
        },
      ],
    },
    {
      slug: 'custom-checks',
      title: 'Custom checks',
      refs: [
        ...fileSizeRecommendedRefs,
        packageJsonPerformanceGroupRef,
        packageJsonDocumentationGroupRef,
        // ...lighthouseCorePerfGroupRefs,
        knipCategoryGroupRef('files'),
        knipCategoryGroupRef('dependencies'),
        knipCategoryGroupRef('exports'),
      ],
    },
  ],
};

export default config;
