// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from 'child_process';
import * as xmlparser from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Issue, IssueType } from './models';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fakesharper" is now active!');

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('fakesharper');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fakesharper.inspectcode', () => {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showWarningMessage('There is no open folder. You can not use this command.');
			return;
		}

		// TODO: Add quick pick for multiple workspace

		vscode.workspace.findFiles('**/*.sln', '**/node_modules/**')
		.then(value => {
			if (value.length === 0) {
				vscode.window.showWarningMessage('Not found any *.sln file. You can not use this command.');
				return;
			}

			const items: vscode.QuickPickItem[] = value.map(x => ({
				label: path.basename(x.fsPath),
				description: x.fsPath
			}));

			vscode.window.showQuickPick(items, {
				placeHolder: 'Select the solution file'
			})
			.then((item: vscode.QuickPickItem | undefined) => {
				if (!item) {
					return;
				}

				const slnName: string = item.label;
				const slnPath: string = item.description || '';
				const slnDirectoryPath = path.dirname(slnPath);
				const xmlPath = path.join(vscode.workspace.rootPath || '', 'build', 'inspectcode.xml');

				vscode.window.showInformationMessage(`Running inspectcode for '${slnName}'`);

				exec(`inspectcode ${slnPath} --output=${xmlPath}`, (err, stdout, stderr) => {
					if (err) {
						vscode.window.showErrorMessage(err.message);
					} else {
						vscode.window.showInformationMessage('Inspect code fnished successfully');

						fs.readFile(xmlPath, (err, data) => {
							if (err) {
								vscode.window.showErrorMessage(`Could not read xml file. ${err.message}`);
								return;
							}

							const xml: string = Buffer.from(data).toString();
							const json: any = xmlparser.parse(xml, {
								attrNodeName: 'attributes',
								ignoreAttributes: false,
								parseAttributeValue: true
							});

							const issueTypes: IssueType[] = [];
							const issues: Issue[] = [];

							for (let i = 0; i < json.Report.IssueTypes.IssueType.length; i++) {
								const item: any = json.Report.IssueTypes.IssueType[i];
								const issueType: IssueType = {
									category: item.attributes["@_Category"],
									categoryId: item.attributes["@_CategoryId"],
									description: item.attributes["@_Description"],
									id: item.attributes["@_Id"],
									severity: item.attributes["@_Severity"],
									wikiUrl: item.attributes["@_WikiUrl"]
								};
								issueTypes.push(issueType);
							}

							for (let i = 0; i < json.Report.Issues.Project.Issue.length; i++) {
								const item: any = json.Report.Issues.Project.Issue[i];
								const issue: Issue = {
									file: path.join(slnDirectoryPath, item.attributes["@_File"]),
									line: parseInt(item.attributes["@_Line"]),
									message: item.attributes["@_Message"],
									offset: {
										start: parseInt(item.attributes["@_Offset"].split('-')[0]),
										end: parseInt(item.attributes["@_Offset"].split('-')[1]),
									},
									typeId: item.attributes["@_TypeId"],

									issueType: issueTypes.filter(x => x.id === item.attributes["@_TypeId"])[0]
								};
								issues.push(issue);
							}

							updateDiagnostics(diagnosticCollection, issues);
						});
					}
				});
			});
		});
	});

	context.subscriptions.push(disposable);
}

function updateDiagnostics(collection: vscode.DiagnosticCollection, issues: Issue[]): void {
	collection.clear();

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
			fileIssues.push({ file: issue.file, issues: [ issue ] });
		}
	}

	for (let i = 0; i < fileIssues.length; i++) {
		const fileIssue: FileIssue = fileIssues[i];

		const uri: vscode.Uri = vscode.Uri.file(fileIssue.file);

		collection.set(uri, fileIssue.issues.map(issue => ({
			message: issue.message,
			range: getRange(issue),
			severity: getSeverity(issue),
			code: issue.typeId,
			source: 'fakesharper',
		})));
	}
}

// TODO: Improve this function. First need to read file once, not for all issue...
function getRange(issue: Issue): vscode.Range {
	const data: string = fs.readFileSync(issue.file).toString();
	const line: number = issue.line;
	let startIndex: number = issue.offset.start;
	let endIndex: number = issue.offset.end;

	const lines: string[] = data.split('\n');

	let index: number = 0;

	for (let i = 0; i < line - 1; i++) {
		index += lines[i].length + 1;
	}

	startIndex -= index;
	endIndex -= index;

	return new vscode.Range(line - 1, startIndex + 1, line - 1, endIndex + 1);
}

function getSeverity(issue: Issue): vscode.DiagnosticSeverity {
	switch (issue.issueType.severity) {
		case 'ERROR': return vscode.DiagnosticSeverity.Error;
		case 'HINT': return vscode.DiagnosticSeverity.Hint;
		case 'SUGGESTION': return vscode.DiagnosticSeverity.Information;
		case 'WARNING': return vscode.DiagnosticSeverity.Warning;
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
