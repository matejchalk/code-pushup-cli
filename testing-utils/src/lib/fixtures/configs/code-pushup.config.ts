import { join } from 'node:path';
import { type CoreConfig } from '@code-pushup/models';

export default {
  persist: { outputDir: join('tmp', 'ts'), filename: 'output.json' },
  upload: {
    organization: 'code-pushup',
    project: 'cli-ts',
    apiKey: 'e2e-api-key',
    server: 'https://e2e.com/api',
  },
  categories: [],
  plugins: [
    {
      audits: [
        {
          slug: 'node-version',
          title: 'Node version',
          description: 'prints node version to file',
          docsUrl: 'https://nodejs.org/',
        },
      ],
      runner: {
        command: 'node',
        args: ['-v'],
        outputFile: 'output.json',
      },
      groups: [],
      slug: 'plugin-1',
      title: 'plugin 1',
      icon: 'javascript',
    },
  ],
} satisfies CoreConfig;