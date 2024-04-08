import 'dotenv/config';
import { z } from 'zod';
import coveragePlugin, {
  getNxCoveragePaths,
} from './dist/packages/plugin-coverage';
import eslintPlugin, {
  eslintConfigFromNxProjects,
} from './dist/packages/plugin-eslint';
import jsPackagesPlugin from './dist/packages/plugin-js-packages';
import type { CoreConfig, UploadConfig } from './packages/models/src';

// load upload configuration from environment
const envSchema = z
  .object({
    CP_SERVER: z.string().url(),
    CP_API_KEY: z.string().min(1),
    CP_ORGANIZATION: z.string().min(1),
    CP_PROJECT: z.string().min(1),
    CP_TIMEOUT: z.number().optional(),
  })
  .partial();
type UploadEnvVars = z.infer<typeof envSchema>;

async function parseEnv(env: unknown = {}): Promise<UploadConfig> {
  const upload: UploadEnvVars = await envSchema.parseAsync(env);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.fromEntries(
    Object.entries(upload).map(([envKey, value]) => {
      switch (envKey) {
        case 'CP_SERVER':
          return ['server', value];
        case 'CP_API_KEY':
          return ['apiKey', value];
        case 'CP_ORGANIZATION':
          return ['organization', value];
        case 'CP_PROJECT':
          return ['project', value];
        case 'CP_TIMEOUT':
          return ['timeout', value];
        default:
          return [];
      }
    }),
  );
}

const config: CoreConfig = {
  upload: await parseEnv(process.env),
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
          '--exclude=test-setup,test-utils'
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
