import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { DUPFINDER_FILENAME, EXTENSION_NAME } from '../../constants';
import { selectSolutionFile } from '../../utils/workspace';
import { DupfinderTreeDataProvider } from './tree';
import { parsefile } from './parser';

export class DupfinderExecutor {
	constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly dataProvider: DupfinderTreeDataProvider
	) { }

	private showStatusBarItem() {
		this.statusBarItem.text = "$(sync~spin) Dupfinder";
		this.statusBarItem.tooltip = "Dupfinder command is running";
		this.statusBarItem.command = `${EXTENSION_NAME}.showoutput`;
		this.statusBarItem.show();
	}

	private hideStatusBarItem() {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.command = undefined;
		this.statusBarItem.hide();
	}

	private executeDupfinder(filePath: string, xmlPath: string) {
		this.output.appendLine(`Dupfinder command is running for '${filePath}'...`);

		const wd: string = path.dirname(filePath);

		const cp = spawn('dupfinder', [filePath, `--output=${xmlPath}`], {
			cwd: wd
		});

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			this.hideStatusBarItem();
			this.output.appendLine('Fnished Dupfinder command.');

			if (code !== 0) {
				vscode.window.showErrorMessage(`Process did not exit with 0 code. Please check output.`);
			} else {
				try {
					const duplicatesReport = parsefile(xmlPath);
					for (let i = 0; i < duplicatesReport.duplicates.length; i++) {
						duplicatesReport.duplicates[i].fragment1.filePath = path.join(wd, duplicatesReport.duplicates[i].fragment1.fileName);
						duplicatesReport.duplicates[i].fragment2.filePath = path.join(wd, duplicatesReport.duplicates[i].fragment2.fileName);
					}
					this.dataProvider.dataSource = duplicatesReport;
				} catch (e) {
					console.error(e);
					vscode.window.showErrorMessage(`${e?.message || e}`);
				}
			}
		});
	}

	public run(): void {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(`Not found any '*.sln' file.`);
				return;
			}

			const xmlPath = path.join(path.dirname(filePath), DUPFINDER_FILENAME);

			this.showStatusBarItem();
			this.executeDupfinder(filePath, xmlPath);
		});
	}
}
