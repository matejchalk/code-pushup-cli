import { ProjectConfiguration, TargetConfiguration } from '@nx/devkit';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  CreateNodes,
  CreateNodesContext,
  CreateNodesResult,
} from 'nx/src/utils/nx-plugin';

export type NormalizedPluginConfiguration = {
  plugin: string;
  options?: unknown;
};

export type CreateNodesOptions = {
  projects?: string[];
};

export type NormalizedCreateNodesContext = CreateNodesContext & {
  projectJson: ProjectConfiguration;
} & { projectRoot: string } & {
  createOptions: CreateNodesOptions;
};

// name has to be "createNodes" to get picked up by nx
export const createNodes: CreateNodes = [
  '**/project.json',
  async (
    projectConfigurationFile: string,
    createNodesOptions: unknown,
    context: CreateNodesContext,
  ): Promise<CreateNodesResult> => {
    const parsedCreateNodesOptions = createNodesOptions as CreateNodesOptions;
    const normalizedContext = await normalizedCreateNodesContext(
      context,
      projectConfigurationFile,
      parsedCreateNodesOptions,
    );

    const { projectRoot, projectJson } = normalizedContext;
    const { name } = projectJson;
    const { projects = [] } = parsedCreateNodesOptions;

    if (!projects.includes(name)) {
      return {};
    }

    try {
      await readFile(join(projectRoot, 'package.json'));
    } catch (e) {
      console.log(projectRoot + '!!!!!!!!!!');
      return {};
    }

    return {
      projects: {
        [projectRoot]: {
          targets: buildTargets(normalizedContext),
        },
      },
    };
  },
];

export async function normalizedCreateNodesContext(
  context: CreateNodesContext,
  projectConfigurationFile: string,
  createOptions: CreateNodesOptions = {},
): Promise<NormalizedCreateNodesContext> {
  const projectRoot = dirname(projectConfigurationFile);

  const projectJson: ProjectConfiguration = JSON.parse(
    (await readFile(projectConfigurationFile)).toString(),
  ) as ProjectConfiguration;
  return {
    ...context,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    projectJson: projectJson ?? ({} as ProjectConfiguration),
    projectRoot,
    createOptions,
  };
}

const prebuildOutputPath = (name: string) => `dist/prebuild/${name}/src`;

function buildTargets(
  options: NormalizedCreateNodesContext,
): Record<string, TargetConfiguration> {
  const { projectJson } = options;
  const { name, sourceRoot, root } = projectJson;
  if (sourceRoot == null) {
    console.log('sourceRoot for project ' + name + ' does not exist');
    return {};
  }

  const projectRoot = join(sourceRoot, '..');

  return {
    prebuild: {
      executor: '@nx/esbuild:esbuild',
      inputs: ['production', '^production'],
      cache: true,
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: prebuildOutputPath(name),
        main: `${sourceRoot}/index.ts`,
        tsConfig: join(projectRoot, 'tsconfig.lib.json'),
      },
    },
    'dual-build': {
      dependsOn: ['^dual-build'],
      executor: '@nx/rollup:rollup',
      outputs: ['{options.outputPath}'],
      defaultConfiguration: 'production',
      options: {
        outputPath: `dist/${sourceRoot}/${name}`,
        main: `${sourceRoot}/index.ts`,
        tsConfig: `${projectRoot}/tsconfig.lib.json`,
        compiler: 'tsc',
        project: `./${projectRoot}/package.json`,
        format: ['cjs', 'esm'],
        assets: [
          {
            glob: `${projectRoot}/**/*.md`,
            input: '.',
            output: '.',
          },
        ],
      },
      configurations: {
        production: {
          optimization: true,
          sourceMap: false,
          namedChunks: false,
          extractLicenses: true,
          vendorChunk: false,
        },
      },
    },
  };
}
