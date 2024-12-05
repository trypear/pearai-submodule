import * as vscode from 'vscode';

type DiffLine = {
  type: 'old' | 'new' | 'same';
  line: string;
};

function normalizeLines(lines: string[]): string[] {
  return lines.map(line => line.trimEnd());
}

export async function* streamRelaceDiffLines(
  originalContent: string,
  modifiedContent: string
): AsyncGenerator<DiffLine> {
  const originalLines = normalizeLines(originalContent.split('\n'));
  const modifiedLines = normalizeLines(modifiedContent.split('\n'));
  
  let i = 0, j = 0;
  
  // Find matching prefix
  while (i < originalLines.length && j < modifiedLines.length && 
         originalLines[i] === modifiedLines[j]) {
    yield { type: 'same', line: originalLines[i] };
    i++; j++;
  }
  
  // Find matching suffix
  let endOrig = originalLines.length - 1;
  let endMod = modifiedLines.length - 1;
  while (endOrig > i && endMod > j && 
         originalLines[endOrig] === modifiedLines[endMod]) {
    endOrig--; endMod--;
  }
  
  // Yield the different parts
  const origDiff = originalLines.slice(i, endOrig + 1);
  const modDiff = modifiedLines.slice(j, endMod + 1);
  
  // Compare line by line in the different section
  let diffI = 0, diffJ = 0;
  while (diffI < origDiff.length || diffJ < modDiff.length) {
    if (diffI >= origDiff.length) {
      yield { type: 'new', line: modDiff[diffJ++] };
    } else if (diffJ >= modDiff.length) {
      // Add CodeLens for deleted line
      vscode.languages.registerCodeLensProvider({ scheme: 'file' }, {
        provideCodeLenses(document) {
          return [
            new vscode.CodeLens(new vscode.Range(diffI, 0, diffI, 0), {
              title: `Deleted: ${origDiff[diffI]}`,
              command: '',
            }),
          ];
        },
      });
      diffI++;
    } else if (origDiff[diffI] !== modDiff[diffJ]) {
      yield { type: 'old', line: origDiff[diffI++] };
      yield { type: 'new', line: modDiff[diffJ++] };
    } else {
      yield { type: 'same', line: origDiff[diffI] };
      diffI++; diffJ++;
    }
  }
  
  // Yield remaining matching suffix
  while (endOrig < originalLines.length - 1) {
    endOrig++;
    yield { type: 'same', line: originalLines[endOrig] };
  }
}