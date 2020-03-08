import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { InspectCodeExecutor } from './executor';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	let disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.inspectcode`, () => {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showWarningMessage('There is no open folder. You can not use this command.');
			return;
		}

		const inspectcodeExecutor = new InspectCodeExecutor(diagnosticCollection);

		vscode.workspace.findFiles('**/*.sln', '**/node_modules/**')
			.then(value => {
				if (value.length === 0) {
					vscode.window.showWarningMessage('Not found any *.sln file. You can not use this command.');
					return;
				}

				const xmlPath = path.join(vscode.workspace.rootPath || '', 'build', 'inspectcode.xml');

				const items: vscode.QuickPickItem[] = value.map(x => ({
					label: path.basename(x.fsPath),
					description: x.fsPath
				}));

				if (items.length === 1) {
					const slnPath: string = items[0].description || '';

					inspectcodeExecutor.run(slnPath, xmlPath, diagnosticCollection);
				} else {
					vscode.window.showQuickPick(items, { placeHolder: 'Select the solution file' })
						.then((item: vscode.QuickPickItem | undefined) => {
							if (!item) {
								return;
							}

							const slnPath: string = item.description || '';

							inspectcodeExecutor.run(slnPath, xmlPath, diagnosticCollection);
						});
				}
			});
	});

	let disposable2 = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.cleandiagnostic`, (textEditor) => {
		diagnosticCollection.delete(textEditor.document.uri);
	});

	let disposable3 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleandiagnostics`, () => {
		diagnosticCollection.clear();
	});

	context.subscriptions.push(disposable, disposable2, disposable3);
}

export function deactivate() { }
