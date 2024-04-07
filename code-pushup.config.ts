import 'dotenv/config';
import { z } from 'zod';
import coveragePlugin, {
  getNxCoveragePaths,
} from './dist/packages/plugin-coverage';
import eslintPlugin, {
  eslintConfigFromNxProjects,
} from './dist/packages/plugin-eslint';
import jsPackagesPlugin from './dist/packages/plugin-js-packages';
import type { CoreConfig } from './packages/models/src';

const config: CoreConfig = {
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
  ],
};

export default config;
