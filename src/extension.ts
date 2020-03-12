import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { CleanupCodeExecutor, InspectCodeExecutor } from './executor';
import { reloadAllDiagnostics } from './diagnostics';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	const output = vscode.window.createOutputChannel(EXTENSION_NAME);
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	let disposableShowOutput = vscode.commands.registerCommand(`${EXTENSION_NAME}.showoutput`, () => {
		output.show();
	});

	let disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.inspectcode`, () => {
		new InspectCodeExecutor(output, statusBarItem, diagnosticCollection).run();
	});

	let disposable2 = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.cleandiagnostics`, (textEditor) => {
		output.appendLine(`Clean Diagnostics command is running for '${textEditor.document.uri.fsPath}'...`);
		diagnosticCollection.delete(textEditor.document.uri);
		output.appendLine('Fnished Clean Diagnostics command.');
	});

	let disposable3 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanalldiagnostics`, () => {
		output.appendLine(`Clean All Diagnostics command is running...`);
		diagnosticCollection.clear();
		output.appendLine('Fnished Clean All Diagnostics command.');
	});

	let disposable4 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanupcode`, () => {
		new CleanupCodeExecutor(output, statusBarItem).run();
	});

	let disposable5 = vscode.commands.registerCommand(`${EXTENSION_NAME}.reloaddiagnostics`, () => {
		output.appendLine(`Reload Diagnostics command is running...`);
		reloadAllDiagnostics(diagnosticCollection);
		output.appendLine('Fnished Reload Diagnostics command.');
	});

	context.subscriptions.push(
		output,
		statusBarItem,
		disposableShowOutput,
		disposable,
		disposable2,
		disposable3,
		disposable4,
		disposable5
	);
}

export function deactivate() { }
