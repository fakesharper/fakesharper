import * as fs from "fs";
import { EOL } from "os";
import * as path from "path";
import * as vscode from "vscode";
import { EXTENSION_NAME, INSPECTION_FILENAME } from "./constants";
import { Issue } from "./models";
import { getIssueRange, getIssueSeverity, restorePath } from "./utils";
import { findFiles } from './workspace';
import { parsefile } from "./xmlparser";

export function reloadAllDiagnostics(diagnosticCollection: vscode.DiagnosticCollection) {
	findFiles(`**/${INSPECTION_FILENAME}`)
		.then(files => {
			diagnosticCollection.clear();

			files.forEach((file) => {
				loadDiagnostics(path.dirname(file.fsPath), diagnosticCollection);
			});
		});
}

export function loadDiagnostics(workspacePath: string, diagnosticCollection: vscode.DiagnosticCollection): void {
	const xmlPath = path.join(workspacePath, INSPECTION_FILENAME);

	if (!fs.existsSync(xmlPath)) {
		return;
	}

	try {
		const issues = parsefile(xmlPath);
		restorePath(workspacePath, issues);
		updateDiagnostics(issues, diagnosticCollection);
	} catch (err) {
		vscode.window.showErrorMessage(`${err?.message || err}`);
	}
}

export function updateDiagnostics(issues: Issue[], diagnosticCollection: vscode.DiagnosticCollection): void {
	diagnosticCollection.clear();

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

		diagnosticCollection.set(uri, fileIssue.issues.map(issue => ({
			message: issue.message + (issue.issueType.wikiUrl ? EOL + issue.issueType.wikiUrl : ''),
			range: getIssueRange(issue),
			severity: getIssueSeverity(issue),
			code: issue.typeId,
			source: EXTENSION_NAME
		})));
	}
}
