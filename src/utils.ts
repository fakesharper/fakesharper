import * as path from 'path';
import * as vscode from 'vscode';
import { File, Issue } from "./models";

/**
 * Converts relative path to absolute path. The file path format is relative in xml.
 * @param basePath *.sln file's directory path.
 * @param files File model array.
 */
export function restoreRelativePaths(basePath: string, files: File[]): void {
	files.forEach(file => {
		file.path = path.join(basePath, file.path);
	});
}

/**
 * Get DiagnosticSeverity from Issue model.
 * @param issue Issue model.
 */
export function getIssueSeverity(issue: Issue): vscode.DiagnosticSeverity {
	switch (issue.issueType.severity) {
		case 'ERROR': return vscode.DiagnosticSeverity.Error;
		case 'HINT': return vscode.DiagnosticSeverity.Hint;
		case 'INFORMATION': return vscode.DiagnosticSeverity.Information;
		case 'SUGGESTION': return vscode.DiagnosticSeverity.Information;
		case 'WARNING': return vscode.DiagnosticSeverity.Warning;
	}
}

/**
 * Creates Range from Issue.
 * @param data File data string.
 * @param issue Issue model.
 */
export function getIssueRange(data: string, issue: Issue): vscode.Range {
	const lineIndex: number = issue.line - 1;
	let startIndex: number = issue.offset.start;
	let endIndex: number = issue.offset.end;

	const lines: string[] = data.split('\n');

	let index: number = 0;

	for (let i = 0; i < lineIndex; i++) {
		index += lines[i].length + 1;
	}

	startIndex -= index;
	endIndex -= index;

	return new vscode.Range(lineIndex, startIndex, lineIndex, endIndex);
}
