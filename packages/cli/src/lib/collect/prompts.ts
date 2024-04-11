import { confirm, input, select } from '@inquirer/prompts';
import simpleGit, { LogOptions } from 'simple-git';
import { getMergedSemverTagsFromBranch } from '@code-pushup/utils';
import { HistoryCliOnlyOptions } from '../history/history.model';

async function promptTargetBranch() {
  const summary = await simpleGit().branch(['-r']);

  return select({
    message: 'Select a branch:',
    choices: summary.all.map(branch => ({ value: branch })),
    default: 'origin/main',
  });
}

function promptCommitTypeFilter() {
  return confirm({
    message: 'Do you want to by semver tagged commits?',
  });
}

async function promptMaxCount() {
  const prompResult = await input({
    message:
      'How many commits/tags should the history include? (Leave empty for all)',
    validate: (v: string | number) => v === '' || !Number.isNaN(Number(v)),
    transformer: (v: string) => (v === '' ? '-1' : v),
  });
  return Number(prompResult);
}

function promptFrom(
  tagsOrCommits: string[],
  { semverTag }: { semverTag: boolean; maxCount?: number },
) {
  return select({
    message: `Select a ${
      semverTag ? 'tag' : 'commit'
    } from which the history should start crawling:`,
    choices: tagsOrCommits.map(tagOrCommit => ({ value: tagOrCommit })),
  });
}

async function promptTo(
  tagsOrCommits: string[],
  {
    semverTag,
    maxCount,
    from,
  }: {
    semverTag: boolean;
    maxCount: number;
    from: string;
  },
) {
  const toIndex = tagsOrCommits.indexOf(from);
  const filteredTagsOrCommits = tagsOrCommits.slice(
    Math.min(maxCount, toIndex + 1),
  );

  if (filteredTagsOrCommits.length > maxCount) {
    const toNeeded = await confirm({
      message: `Do you want to specify until where the history should crawl?`,
      default: false,
    });
    if (toNeeded) {
      return await select({
        message: `Select a ${
          semverTag ? 'tag' : 'commit'
        } until which the history should crawl:`,
        choices: filteredTagsOrCommits.map(tagOrCommit => ({
          value: tagOrCommit,
        })),
      });
    }
  }

  return '';
}

async function filterByCommitType(
  targetBranch: string,
  { semverTag = true }: { semverTag: boolean },
) {
  return semverTag
    ? await getMergedSemverTagsFromBranch(targetBranch)
    : (await simpleGit().log()).all.map(({ hash }) => hash);
}

export async function historyPrompt<
  O extends Partial<LogOptions> & HistoryCliOnlyOptions,
>(options?: O) {
  const { targetBranch, maxCount = -1, from, to, semverTag } = options ?? {};

  // 1. branch name
  const targetBranchInput = targetBranch ?? (await promptTargetBranch());

  // 2. list tags only or all commits
  const semverTagInput = semverTag ?? (await promptCommitTypeFilter());

  // 3. number of history walks
  const maxCountInput = maxCount < 0 ? await promptMaxCount() : maxCount;

  const tagsOrCommits = await filterByCommitType(targetBranchInput, {
    semverTag: semverTagInput,
  });

  // 4. select start
  const fromInput =
    from ??
    (await promptFrom(tagsOrCommits, {
      semverTag: semverTagInput,
      maxCount: maxCountInput,
    }));

  // 5. select optional end
  // eslint-disable-next-line functional/no-let
  const toInput =
    to ??
    (await promptTo(tagsOrCommits, {
      semverTag: semverTagInput,
      from: fromInput,
      maxCount: maxCountInput,
    }));

  // create partial history options
  return {
    ...(targetBranchInput === '' ? {} : { branch: targetBranchInput }),
    ...(fromInput === '' ? {} : { from: fromInput }),
    ...(toInput === '' ? {} : { to: toInput }),
    ...(maxCountInput >= 0 ? { maxCount: maxCountInput } : {}),
  };
}
