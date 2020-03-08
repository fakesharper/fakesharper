import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Issue } from "./models";

/**
 * File paths in xml files are relative format. This function convert relative paths to absolute paths.
 * @param slnDirPath sln file directory path
 * @param issues Issue list
 */
export function restorePath(slnDirPath: string, issues: Issue[]) {
	for (let i = 0; i < issues.length; i++) {
		const issue: Issue = issues[i];
		issue.file = path.join(slnDirPath, issue.file);
	}
}

export function getIssueSeverity(issue: Issue): vscode.DiagnosticSeverity {
	switch (issue.issueType.severity) {
		case 'ERROR': return vscode.DiagnosticSeverity.Error;
		case 'HINT': return vscode.DiagnosticSeverity.Hint;
		case 'SUGGESTION': return vscode.DiagnosticSeverity.Information;
		case 'WARNING': return vscode.DiagnosticSeverity.Warning;
	}
}

// TODO: Improve this function. First need to read file once, not for all issue...
export function getIssueRange(issue: Issue): vscode.Range {
	const data: string = fs.readFileSync(issue.file).toString();
	const bom: boolean = data.length > 0 && data.charCodeAt(0) === 65279;
	const line: number = issue.line;
	let startIndex: number = issue.offset.start;
	let endIndex: number = issue.offset.end;

	const lines: string[] = data.split('\n');

	let index: number = 0;

	if (bom && line !== 1) {
		// if charset is 'xxx with BOM' first line's length will be +1
		index--; // BOM
	}

	for (let i = 0; i < line - 1; i++) {
		index += lines[i].length + 1;
	}

	startIndex -= index;
	endIndex -= index;

	return new vscode.Range(line - 1, startIndex, line - 1, endIndex);
}
