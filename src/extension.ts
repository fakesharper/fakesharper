import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { reloadAllDiagnostics } from './modules/inspectcode/diagnostics';
import { InspectCodeExecutor } from './modules/inspectcode/executor';
import { CleanupCodeExecutor } from './modules/cleancode/executor';
import { DupfinderExecutor } from './modules/dupfinder/executor';
import { Fragment } from './modules/dupfinder/models';
import { DupfinderTreeDataProvider } from './modules/dupfinder/tree';
import { JetBrainsInstaller } from './utils/jetbrainsinstaller';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	const output = vscode.window.createOutputChannel(EXTENSION_NAME);
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	const dataProvider = new DupfinderTreeDataProvider();

	const jbInstaller = new JetBrainsInstaller(output);
	jbInstaller.verifyInstallation();

	const tree = vscode.window.createTreeView(`dupfinder`, {
		canSelectMany: false,
		treeDataProvider: dataProvider
	});

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

	let disposable6 = vscode.commands.registerCommand(`${EXTENSION_NAME}.dupfinder.run`, () => {
		new DupfinderExecutor(output, statusBarItem, dataProvider).run();
	});

	let disposable7 = vscode.commands.registerCommand(`${EXTENSION_NAME}.dupfinder.show`, async (fragment1: Fragment, fragment2: Fragment) => {
		const textDocument = await vscode.workspace.openTextDocument(fragment1.filePath);
		const textEditor = await vscode.window.showTextDocument(textDocument);

		const p11 = textDocument.positionAt(fragment1.offsetRange.start);
		const p12 = textDocument.positionAt(fragment1.offsetRange.end);

		if (fragment1.fileName !== fragment2.fileName) {
			textEditor.selection = new vscode.Selection(p11, p12);
		} else {
			const p21 = textDocument.positionAt(fragment2.offsetRange.start);
			const p22 = textDocument.positionAt(fragment2.offsetRange.end);

			textEditor.selections = [new vscode.Selection(p11, p12), new vscode.Selection(p21, p22)];
		}

		textEditor.revealRange(textEditor.selection, vscode.TextEditorRevealType.InCenter);
	});

	let disposable8 = vscode.commands.registerCommand(`${EXTENSION_NAME}.dupfinder.clean`, () => {
		dataProvider.dataSource = undefined;
	});

	context.subscriptions.push(
		output,
		statusBarItem,
		tree,
		disposableShowOutput,
		disposable,
		disposable2,
		disposable3,
		disposable4,
		disposable5,
		disposable6,
		disposable7,
		disposable8
	);
}

export function deactivate() { }
