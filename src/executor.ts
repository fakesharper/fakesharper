import { execSync } from 'child_process';
import * as path from 'path';
import { EOL } from 'os';
import * as vscode from 'vscode';
import { parsefile } from './xmlparser';
import { restorePath, getIssueSeverity, getIssueRange } from './utils';
import { Issue } from './models';
import { EXTENSION_NAME } from './constants';

/**
 * Executes the `inspectcode` command on cli
 * @param filePath sln or project file path
 * @param output xml file path to create issues
 */
export function executeInspectCode(filePath: string, output: string) {
	execSync(`inspectcode ${filePath} --output=${output}`);
}

export class InspectCodeExecutor {
	private _dg: vscode.DiagnosticCollection;

	constructor(dg: vscode.DiagnosticCollection) {
		this._dg = dg;
	}

	run(slnPath: string, xmlPath: string, diagnosticCollection: vscode.DiagnosticCollection): void {
		const slnName: string = path.basename(slnPath);
		const slnDirPath = path.dirname(slnPath);

		try {
			// TODO: Log sln name
			executeInspectCode(slnPath, xmlPath);
			const issues = parsefile(xmlPath);
			restorePath(slnDirPath, issues);
			this.updateDiagnostics(issues);
			vscode.window.showInformationMessage('Inspect code fnished successfully');
		} catch (ex) {
			console.error(ex);
			vscode.window.showErrorMessage(`${ex?.message || ex}`);
		}
	};


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
