import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { CleanupCodeExecutor, InspectCodeExecutor } from './executor';
import { reloadAllDiagnostics } from './diagnostics';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	let disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.inspectcode`, () => {
		new InspectCodeExecutor(statusBarItem, diagnosticCollection).run();
	});

	let disposable2 = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.cleandiagnostics`, (textEditor) => {
		diagnosticCollection.delete(textEditor.document.uri);
	});

	let disposable3 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanalldiagnostics`, () => {
		diagnosticCollection.clear();
	});

	let disposable4 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanupcode`, () => {
		new CleanupCodeExecutor(statusBarItem).run();
	});

	let disposable5 = vscode.commands.registerCommand(`${EXTENSION_NAME}.reloaddiagnostics`, () => {
		reloadAllDiagnostics(diagnosticCollection);
	});

	context.subscriptions.push(
		statusBarItem,
		disposable,
		disposable2,
		disposable3,
		disposable4,
		disposable5
	);
}

export function deactivate() { }
