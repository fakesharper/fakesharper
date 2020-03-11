import { DiagnosticCollection } from "vscode";
import { statSync } from "fs";
import { parsefile } from "./xmlparser";
import { restorePath, getIssueRange, getIssueSeverity } from "./utils";
import { Issue } from "./models";
import { EXTENSION_NAME, INSPECTION_FILENAME } from "./constants";
import { EOL } from "os";
import * as vscode from 'vscode';
import { join } from "path";

export function runAllDiagnostics(statusBarItem: vscode.StatusBarItem, diagnosticCollection: DiagnosticCollection) {
	statusBarItem.text = "$(sync~spin) Running Diagnostics";
	statusBarItem.tooltip = "Running diagnostics";
	statusBarItem.show();

	vscode.workspace.workspaceFolders?.forEach((workspaceFolder) => {
		runDiagnostics(workspaceFolder.uri.fsPath, diagnosticCollection);
	});

	statusBarItem.text = "fakesharper";
	statusBarItem.tooltip = undefined;
	statusBarItem.hide();
}

export function runDiagnostics(workspacePath: string, diagnosticCollection: DiagnosticCollection): void {
  const xmlPath = join(workspacePath, INSPECTION_FILENAME);

  try {
    statSync(xmlPath);
  } catch (err) {
    // No diagnostics file - should clear the diagnostics
    diagnosticCollection.clear();
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

export function updateDiagnostics(issues: Issue[], diagnosticCollection: DiagnosticCollection): void {
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