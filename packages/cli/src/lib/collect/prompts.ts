import { confirm, input, select } from '@inquirer/prompts';
import { Prompt } from '@inquirer/type';
import simpleGit, { LogOptions } from 'simple-git';
import { getMergedSemverTagsFromBranch } from '@code-pushup/utils';

export async function historyPrompt<
  O extends Partial<LogOptions> & { branch?: string },
>(options?: O) {
  const { branch, maxCount = -1, from, to } = options ?? {};

  // 1. branch name
  const branchSummary = await simpleGit().branch(['-r']);
  const branchInput =
    branch ??
    (await select({
      message: 'Select a branch:',
      choices: branchSummary.all.map(branch => ({ value: branch })),
      default: 'origin/main',
    }));

  // 2. list tags only or all commits
  const filterBy = await select({
    message: 'Do you want to crawl tags or commits?',
    choices: [{ value: 'tag' }, { value: 'commit' }],
  });

  // 3. number of history walks
  const maxCountInput =
    maxCount < 0
      ? Number(
          await input({
            message:
              'How many commits/tags should the history include? (Leave empty for all)',
            validate: v => v === '' || !isNaN(Number(v)),
            transformer: v => (v === '' ? '-1' : v),
          }),
        )
      : maxCount;

  // 4. select start
  const tagsOrCommits =
    filterBy === 'tag'
      ? await getMergedSemverTagsFromBranch(branchInput)
      : (await simpleGit().log()).all.map(({ hash }) => hash);

  const fromInput =
    from ??
    (await select({
      message: `Select a ${filterBy} from which the history should start crawling:`,
      choices: tagsOrCommits.map(tagOrCommit => ({ value: tagOrCommit })),
    }));

  const toIndex = tagsOrCommits.indexOf(fromInput);
  const filteredTagsOrCommits = tagsOrCommits.slice(
    Math.min(maxCountInput, toIndex + 1),
  );

  // 5. select optional end
  // eslint-disable-next-line functional/no-let
  let toInput = '';
  if (filteredTagsOrCommits.length > maxCountInput) {
    const toNeeded = await confirm({
      message: `Do you want to specify until where the history should crawl?`,
      default: false,
    });
    if (toNeeded) {
      toInput =
        to ??
        (await select({
          message: `Select a ${filterBy} until which the history should crawl:`,
          choices: filteredTagsOrCommits.map(tagOrCommit => ({
            value: tagOrCommit,
          })),
        }));
    }
  }

  // create partial history options
  return {
    branch: branchInput,
    ...(fromInput !== '' ? { from: fromInput } : {}),
    ...(toInput !== '' ? { to: toInput } : {}),
    ...(maxCountInput >= 0 ? { maxCount: maxCountInput } : {}),
  };
}
