import { exec } from 'child_process';
import { EOL } from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { parsefile } from './xmlparser';
import { restorePath, getIssueSeverity, getIssueRange } from './utils';
import { Issue } from './models';
import { EXTENSION_NAME } from './constants';

export class InspectCodeExecutor {
	private readonly _dg: vscode.DiagnosticCollection;
	private readonly _statusBarItem: vscode.StatusBarItem;

	constructor(dg: vscode.DiagnosticCollection, statusBarItem: vscode.StatusBarItem) {
		this._dg = dg;
		this._statusBarItem = statusBarItem;
	}

	run(slnPath: string, xmlPath: string): void {
		this._statusBarItem.text = "$(sync~spin) Inspect Code";
		this._statusBarItem.tooltip = "Inspect Code command is running";
		this._statusBarItem.show();

		this.executeInspectCode(slnPath, xmlPath);
	};

	executeInspectCode(slnPath: string, xmlPath: string): void {
		exec(`inspectcode ${slnPath} --output=${xmlPath}`, (error, stdout) => {
			if (error) {
				this._statusBarItem.hide();
				vscode.window.showErrorMessage(error.message);
				return;
			}

			this.doThings(slnPath, xmlPath);
		});
	}

	doThings(slnPath: string, xmlPath: string): void {
		try {
			const slnDirPath = path.dirname(slnPath);

			const issues = parsefile(xmlPath);
			restorePath(slnDirPath, issues);
			this.updateDiagnostics(issues);
			this._statusBarItem.hide();
		} catch (err) {
			this._statusBarItem.hide();
			vscode.window.showErrorMessage(`${err?.message || err}`);
		}
	}

	updateDiagnostics(issues: Issue[]): void {
		this._dg.clear();

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

			this._dg.set(uri, fileIssue.issues.map(issue => ({
				message: issue.message + (issue.issueType.wikiUrl ? EOL + issue.issueType.wikiUrl : ''),
				range: getIssueRange(issue),
				severity: getIssueSeverity(issue),
				code: issue.typeId,
				source: EXTENSION_NAME
			})));
		}
	}
}
