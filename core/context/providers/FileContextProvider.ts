import fuzzysort from 'fuzzysort';
import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
  ContextSubmenuItem,
  LoadSubmenuItemsArgs,
} from "../../index.js";
import { walkDir } from "../../indexing/walkDir.js";
import {
  getBasename,
  getUniqueFilePath,
  groupByLastNPathParts,
} from "../../util/index.js";
import { BaseContextProvider } from "../index.js";

const MAX_SUBMENU_ITEMS = 10_000;

class FileContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "file",
    displayTitle: "Files",
    description: "Type to search",
    type: "submenu",
  };

  private splitIntoWords(filename: string): string[] {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .split(/[-_.\s]/g)
      .filter(Boolean)
      .map(word => word.toLowerCase());
  }

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    // Assume the query is a filepath
    query = query.trim();
    const content = await extras.ide.readFile(query);
    return [
      {
        name: query.split(/[\\/]/).pop() ?? query,
        description: query,
        content: `\`\`\`${query}\n${content}\n\`\`\``,
      },
    ];
  }

  async loadSubmenuItems(
    args: LoadSubmenuItemsArgs,
  ): Promise<ContextSubmenuItem[]> {
    const workspaceDirs = await args.ide.getWorkspaceDirs();
    const results = await Promise.all(
      workspaceDirs.map((dir) => {
        return walkDir(dir, args.ide);
      }),
    );
    const files = results.flat().slice(-MAX_SUBMENU_ITEMS);
    const fileGroups = groupByLastNPathParts(files, 2);

    // Prepare files for fuzzy search
    const searchableFiles = files.map(file => ({
      id: file,
      title: getBasename(file),
      description: getUniqueFilePath(file, fileGroups),
      path: file // Keep original path for searching
    }));

    // Return function that can be used for searching
    return searchableFiles.map(file => ({
      id: file.id,
      title: file.title,
      description: file.description,
      searchStr: `${file.title} ${file.path}`, // Combined string for better fuzzy matching
    }));
  }

  // Override the default search to use word-based matching first, then fuzzy
  async search(items: ContextSubmenuItem[], query: string): Promise<ContextSubmenuItem[]> {
    if (!query) return items.slice(0, 20);

    const lowerQuery = query.toLowerCase();

    // First find exact word matches in filenames
    const exactMatches = items.filter(item => {
      const words = this.splitIntoWords(item.title);
      return words.some(word => word.startsWith(lowerQuery));
    });

    // Then get fuzzy matches for remaining items
    const remainingItems = items.filter(item => 
      !exactMatches.includes(item)
    );
    
    const fuzzyResults = fuzzysort.go(query, remainingItems, {
      keys: ['title', 'searchStr'],
      limit: Math.max(20 - exactMatches.length, 0),
      threshold: -10000,
    });

    // Combine exact matches and fuzzy matches
    return [
      ...exactMatches,
      ...(fuzzyResults.map(r => r.obj))
    ];
  }
}

export default FileContextProvider;
