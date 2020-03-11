import * as path from 'path';
import * as vscode from 'vscode';

export function findFiles(glob: vscode.GlobPattern, maxResults?: number): Thenable<vscode.Uri[]> {
	return vscode.workspace.findFiles(glob, '**/node_modules/**', maxResults);
}

export function selectFile(glob: vscode.GlobPattern, onSelect: ((path: string | undefined) => void)): void {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showWarningMessage('There is no open folder.');
		return;
	}

	findFiles(glob)
		.then(value => {
			if (value.length === 0) {
				onSelect(undefined);
			} else if (value.length === 1) {
				onSelect(value[0].fsPath);
			} else {
				const items: vscode.QuickPickItem[] = value.map(x => ({
					label: path.basename(x.fsPath),
					description: x.fsPath
				}));

				vscode.window.showQuickPick(items, { placeHolder: 'Select file' })
					.then(value => {
						if (value) {
							onSelect(value.description as string);
						}
					});
			}
		});
}

export function selectSolutionFile(onSelect: ((path: string | undefined) => void)): void {
	selectFile('**/*.sln', onSelect);
}
