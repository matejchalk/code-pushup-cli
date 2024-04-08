import { PluginConfiguration } from '@nx/devkit';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import type { PluginConfig, UploadConfig } from '@code-pushup/models';
import type { NormalizedCreateNodesContext } from '../model';
import { CodePushupTargetOptions } from './model';

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

export async function coreOptions(
  createNodeContext: NormalizedCreateNodesContext,
  // projectJson: Pick<CreateTargetOptions, 'projectPrefix'> & Pick<ProjectConfiguration, 'name' | 'sourceRoot'>
): Promise<CodePushupTargetOptions> {
  const { workspaceRoot, projectRoot, projectJson, createOptions } =
    createNodeContext;

  const { name: projectName = '' } = projectJson;

  const { projectPrefix, plugins } = createOptions;
  const prefix = projectPrefix ? `${projectPrefix}-` : undefined;
  const rootDir = projectRoot === '.' ? projectRoot : workspaceRoot;

  return {
    // For better debugging use `--verbose --no-progress`
    // verbose: true,
    progress: false,
    persist: {
      format: ['md', 'json'], // * - For all formats use `--persist.format=md,json`
      outputDir: join(
        resolve(rootDir, workspaceRoot),
        '.code-pushup',
        projectName,
      ), // always in root .code-pushup/<project>
    },
    upload: {
      ...(await parseEnv(process.env)),
      ...(projectName
        ? {
            project: prefix ? `${prefix}${projectName}` : projectName, // provide correct project
          }
        : {}),
    },
     plugins: await resolvePluginsConfigs({plugins}),
  };
}

export type ResolvePluginsOptions = {
  plugins: PluginConfiguration[];
};

// load plugins by PluginConfiguration. plugin string referencing the plugin module
export async function resolvePluginsConfigs({
  plugins = [],
}: ResolvePluginsOptions): Promise<PluginConfig[]> {
  const loadResult = await Promise.all(
    plugins.map(plugin => {
      const { plugin: pluginRef, options: pluginOptions } = (
        typeof plugin === 'string' ? { plugin } : plugin
      ) as {
        plugin: string;
        options?: unknown;
      };
      // @TODO implement plugin loading
      // console.info(`load plugin ${pluginRef} with options: ${JSON.stringify(pluginOptions)} not implemented`);
      //  The next line throws:
      //  The entry point "packages/plugin-js-packages/index.ts" cannot be marked as external
      // const {mod} = (await bundleRequire({filepath: 'packages/plugin-js-packages/index.ts'}));
      const slug =
        (pluginRef.includes('.') ? dirname(pluginRef) : pluginRef)
          .split('/')
          .at(-1) ?? '';

      return {
        plugin: (options?: unknown) =>
          ({
            slug: slug,
            title: slug
              .split('-')
              .map(i => i.at(0)?.toUpperCase() + i.slice(1))
              .join(' '),
            description: JSON.stringify(options),
          } as unknown as PluginConfig),

        options: pluginOptions,
      };
    }),
  );

  return Promise.all(
    loadResult.map(({ plugin: createPlugin, options }) =>
      createPlugin(options),
    ),
  );
}
