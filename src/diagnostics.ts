import * as fs from "fs";
import { EOL } from "os";
import * as path from "path";
import * as vscode from "vscode";
import { EXTENSION_NAME, INSPECTION_FILENAME } from "./constants";
import { readFileSync } from './file';
import { File } from "./models";
import { getIssueRange, getIssueSeverity, restoreRelativePaths } from "./utils";
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

export function loadDiagnostics(basePath: string, diagnosticCollection: vscode.DiagnosticCollection): void {
	const xmlPath = path.join(basePath, INSPECTION_FILENAME);

	if (!fs.existsSync(xmlPath)) {
		return;
	}

	try {
		const files: File[] = parsefile(xmlPath);
		restoreRelativePaths(basePath, files);
		updateDiagnostics(files, diagnosticCollection);
	} catch (err) {
		vscode.window.showErrorMessage(`${err?.message || err}`);
	}
}

export function updateDiagnostics(files: File[], diagnosticCollection: vscode.DiagnosticCollection): void {
	for (let i = 0; i < files.length; i++) {
		const file: File = files[i];

		const data: string = readFileSync(file.path);
		const uri: vscode.Uri = vscode.Uri.file(file.path);

		diagnosticCollection.set(uri, file.issues.map(issue => ({
			message: issue.message + (issue.issueType.wikiUrl ? EOL + issue.issueType.wikiUrl : ''),
			range: getIssueRange(data, issue),
			severity: getIssueSeverity(issue),
			code: issue.typeId,
			source: EXTENSION_NAME
		})));
	}
}
