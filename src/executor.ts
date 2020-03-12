import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME, INSPECTION_FILENAME } from './constants';
import { selectSolutionFile } from './workspace';
import { loadDiagnostics } from './diagnostics';

export class InspectCodeExecutor {
	constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly diagnosticCollection: vscode.DiagnosticCollection
	) { }

	private showStatusBarItem(): void {
		this.statusBarItem.text = "$(sync~spin) Inspect Code";
		this.statusBarItem.tooltip = "Inspect Code command is running";
		this.statusBarItem.show();
	};

	private hideStatusBarItem(): void {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.hide();
	}

	private executeInspectCode(filePath: string, xmlPath: string): void {
		this.output.appendLine(`Inspect Code command is running for '${filePath}'...`);

		const cp = spawn('inspectcode', [filePath, `--output=${xmlPath}`]);

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				vscode.window.showErrorMessage(`Process did not exit with 0 code. Please check output.`);
				this.statusBarItem.hide();
			} else {
				const dirPath = path.dirname(filePath);

				this.diagnosticCollection.clear();
				loadDiagnostics(dirPath, this.diagnosticCollection);

				this.hideStatusBarItem();
				this.output.appendLine('Fnished Inspect Code command.');
			}
		});
	}

	public run(): void {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(`Not found any '*.sln' file.`);
				return;
			}

			const xmlPath = path.join(path.dirname(filePath), INSPECTION_FILENAME);

			this.showStatusBarItem();
			this.executeInspectCode(filePath, xmlPath);
		});
	}
}

export class CleanupCodeExecutor {
	public constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem
	) { }

	private showStatusBarItem() {
		this.statusBarItem.text = "$(sync~spin) Cleanup Code";
		this.statusBarItem.tooltip = "Cleanup Code command is running";
		this.statusBarItem.show();
	}

	private hideStatusBarItem() {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.hide();
	}

	private executeCleanupCode(filePath: string): void {
		this.output.appendLine(`Cleanup Code command is running for '${filePath}'...`);

		const cp = spawn('cleanupcode', [filePath]);

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				vscode.window.showErrorMessage(`Process did not exit with 0 code. Please check output.`);
			}

			this.hideStatusBarItem();
			this.output.appendLine('Fnished Cleanup Code command.');
		});
	}

	public run() {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(`Not found any '*.sln' file.`);
				return;
			}

			vscode.window.showQuickPick(['No. Do not change my codes.', 'Yes. Cleanup my codes.'], {
				placeHolder: 'WARNING! Can i change your codes?'
			}).then(value => {
				if (value && value.startsWith('Yes')) {
					this.showStatusBarItem();
					this.executeCleanupCode(filePath);
				}
			});
		});
	}
}
