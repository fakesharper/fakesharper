import { exec } from 'child_process';
import { EOL } from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME } from './constants';
import { Issue } from './models';
import { restorePath, getIssueSeverity, getIssueRange } from './utils';
import { selectSolutionFile } from './workspace';
import { parsefile } from './xmlparser';

export class InspectCodeExecutor {
	constructor(
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly diagnosticCollection: vscode.DiagnosticCollection
	) { }

	private showStatusBarItem(): void {
		this.statusBarItem.text = "$(sync~spin) Inspect Code";
		this.statusBarItem.tooltip = "Inspect Code command is running";
		this.statusBarItem.show();
	};

	private hideStatusBarItem(): void {
		this.statusBarItem.text = "fakesharper";
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.hide();
	}

	private executeInspectCode(filePath: string, xmlPath: string): void {
		exec(`inspectcode ${filePath} --output=${xmlPath}`, (error, stdout) => {
			if (error) {
				this.statusBarItem.hide();
				vscode.window.showErrorMessage(error.message);
			} else {
				const dirPath = path.dirname(filePath);

				try {
					const issues = parsefile(xmlPath);
					restorePath(dirPath, issues);
					this.updateDiagnostics(issues);
				} catch (err) {
					vscode.window.showErrorMessage(`${err?.message || err}`);
				} finally {
					this.hideStatusBarItem();
				}
			}
		});
	}

	private updateDiagnostics(issues: Issue[]): void {
		this.diagnosticCollection.clear();

		type FileIssue = {
			file: string;
			issues: Issue[];
		};

		const fileIssues: FileIssue[] = [];

		for (let i = 0; i < issues.length; i++) {
			const issue: Issue = issues[i];
			let fileIssueExists: boolean = false;
			for (let j = 0; j < fileIssues.length; j++) {
				const fileIssue: FileIssue = fileIssues[j];

				if (issue.file === fileIssue.file) {
					fileIssue.issues.push(issue);
					fileIssueExists = true;
					break;
				}
			}

			if (!fileIssueExists) {
				fileIssues.push({ file: issue.file, issues: [issue] });
			}
		}

		for (let i = 0; i < fileIssues.length; i++) {
			const fileIssue: FileIssue = fileIssues[i];

			const uri: vscode.Uri = vscode.Uri.file(fileIssue.file);

			this.diagnosticCollection.set(uri, fileIssue.issues.map(issue => ({
				message: issue.message + (issue.issueType.wikiUrl ? EOL + issue.issueType.wikiUrl : ''),
				range: getIssueRange(issue),
				severity: getIssueSeverity(issue),
				code: issue.typeId,
				source: EXTENSION_NAME
			})));
		}
	}

	public run(): void {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(`Not found any '*.sln' file.`);
				return;
			}

			const xmlPath = path.join(path.dirname(filePath), 'inspectcode.xml');

			this.showStatusBarItem();
			this.executeInspectCode(filePath, xmlPath);
		});
	}
}
