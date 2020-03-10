import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { InspectCodeExecutor } from './executor';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	let disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.inspectcode`, () => {
		new InspectCodeExecutor(statusBarItem, diagnosticCollection).run();
	});

	let disposable2 = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.cleandiagnostic`, (textEditor) => {
		diagnosticCollection.delete(textEditor.document.uri);
	});

	let disposable3 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleandiagnostics`, () => {
		diagnosticCollection.clear();
	});

	context.subscriptions.push(disposable, disposable2, disposable3, statusBarItem);
}

export function deactivate() { }
