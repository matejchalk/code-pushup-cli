import { TargetConfiguration, joinPathFragments } from '@nx/devkit';
import { readdir } from 'node:fs/promises';
import { CP_TARGET_NAME } from '../../utils/constants';
import type { NormalizedCreateNodesContext } from '../model';
import { coreOptions } from './code-pushup-helper';
import { CodePushupTargetOptions } from './model';

export type Targets<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  [targetName in keyof T]: TargetConfiguration<CodePushupTargetOptions>;
};

export type CreateTargetOptions = {
  targetName?: string;
  projectPrefix?: string;
};

export async function codePushupTargets(
  normalizedContext: NormalizedCreateNodesContext,
) {
  const { targetName = CP_TARGET_NAME } = normalizedContext.createOptions;
  const rootFiles = await readdir(normalizedContext.projectRoot);
  // if NO code-pushup.config.*.(ts|js|mjs) is present return init target
  if (
    rootFiles.some(filename =>
      filename.match(/code-pushup\.config.(\w*\.)*(ts|js|mjs)$/),
    )
  ) {
    const target = await codePushupTarget(normalizedContext);
    return { [targetName]: target };
  }
  // return code-pushup cli target
  else {
    return {
      [`${targetName}--init`]: initTarget(normalizedContext.projectJson.name),
    };
  }
}

export async function codePushupTarget(
  createNodeContext: NormalizedCreateNodesContext,
) {
  const { createOptions, projectRoot, workspaceRoot } = createNodeContext;
  const {
    // projectPrefix,
    // targetName: _,
    ...unparsedOptions
  } = createOptions;

  const parseUploadOptions = (options: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(options).map(([opt, val]) => {
        if (['project', 'organization', 'api-key', 'server'].includes(opt)) {
          return [`upload.${opt}`, val];
        }
        return [opt, val];
      }),
    );

  const target = {
    command: `node ${workspaceRoot}/dist/packages/cli/index.js`,
    options: {
      ...parseUploadOptions(unparsedOptions),
      // parse options related to the code-pushup logic
      ...(await coreOptions(createNodeContext)),
      // if a projectRoot is given switch cwd to it
      ...(projectRoot && { cwd: joinPathFragments(projectRoot) }), // normalized filesystem path to eliminate potential different separators (\ for Windows, / for Unix-like systems).
    },
  } satisfies TargetConfiguration;

  return cliTarget(target);
}

export function initTarget(projectName?: string): TargetConfiguration {
  const projectFlag = projectName ? ` --project=${projectName}` : projectName;
  return {
    command: `nx g nx-plugin:init${projectFlag ?? ''}`,
  };
}

function cliTarget<T extends CodePushupTargetOptions>(
  target: TargetConfiguration<Record<string, unknown>>,
  options?: T,
): TargetConfiguration<T> {
  // eslint-disable-next-line  @typescript-eslint/consistent-type-assertions
  const opt = options ?? ({} as T);
  return {
    ...target,
    options: {
      ...target.options,
      ...opt,
    },
  } satisfies TargetConfiguration<T>;
}
