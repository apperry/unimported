import { TraverseResult } from './traverse';
import { Context } from './index';
import { ensureArray } from './ensureArray';

export interface ProcessedResult {
  unresolved: [string, string[]][];
  unimported: string[];
  unused: string[];
  clean: boolean;
}

type FormatTypes = keyof Pick<
  Context,
  'showUnusedFiles' | 'showUnusedDeps' | 'showUnresolvedImports'
>;

function index(array: string | string[]): { [key: string]: boolean } {
  return ensureArray(array).reduce((acc, str) => {
    acc[str] = true;
    return acc;
  }, {});
}

export async function processResults(
  files: string[],
  traverseResult: TraverseResult,
  context: Context,
): Promise<ProcessedResult> {
  const ignoreUnresolvedIdx = index(context.config.ignoreUnresolved);
  const ignoreUnusedIdx = index(context.config.ignoreUnused);
  const ignoreUnimportedIdx = index(context.config.ignoreUnimported);

  const unresolved = Array.from(traverseResult.unresolved).filter(
    ([x]) => !ignoreUnresolvedIdx[x],
  );

  const unused = Object.keys(context.dependencies).filter(
    (x) =>
      !traverseResult.modules.has(x) &&
      !context.peerDependencies[x] &&
      !ignoreUnusedIdx[x],
  );

  const unimported = files
    .filter((x) => !traverseResult.files.has(x))
    .map((x) => x.replace(context.cwd + '/', ''))
    .filter((x) => !ignoreUnimportedIdx[x]);

  const formatTypeResultMap: { [P in FormatTypes]: boolean } = {
    showUnusedFiles: !unimported.length,
    showUnusedDeps: !unused.length,
    showUnresolvedImports: !unresolved.length,
  };

  const isClean = Object.keys(formatTypeResultMap).some((key) => context[key])
    ? Object.keys(formatTypeResultMap).every((key) =>
        context[key] ? formatTypeResultMap[key] : true,
      )
    : Object.values(formatTypeResultMap).every((v) => v);

  return {
    unresolved,
    unused,
    unimported,
    clean: isClean,
  };
}
