import * as fxp from 'fast-xml-parser';
import * as path from 'path';
import * as file from './file';
import { IssueType, Issue, File } from "./models";

/**
 * Parses xml file data to File model array
 * @param filePath Xml file path
 */
export function parsefile(filePath: string): File[] {
	const xml: string = file.readFileSync(filePath);

	const json: any = fxp.parse(xml, {
		attrNodeName: 'attributes',
		ignoreAttributes: false,
		parseAttributeValue: true
	});

	const fileIssueLists: File[] = [];
	const issueTypes: IssueType[] = [];

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

	const addIssue = function (item: any): void {
		const issue: Issue = {
			file: item.attributes["@_File"].replace(/\\/g, path.sep),
			line: parseInt(item.attributes["@_Line"]),
			message: item.attributes["@_Message"],
			offset: {
				start: parseInt(item.attributes["@_Offset"].split('-')[0]),
				end: parseInt(item.attributes["@_Offset"].split('-')[1]),
			},
			typeId: item.attributes["@_TypeId"],

			issueType: issueTypes.filter(x => x.id === item.attributes["@_TypeId"])[0]
		};

		let added: boolean = false;

		for (let i = 0; i < fileIssueLists.length; i++) {
			if (fileIssueLists[i].path === issue.file) {
				fileIssueLists[i].issues.push(issue);
				added = true;
				break;
			}
		}

		if (!added) {
			fileIssueLists.push({
				path: issue.file,
				issues: [issue]
			});
		}
	};

	if (json.Report.Issues.Project.Issue) {
		for (let i = 0; i < json.Report.Issues.Project.Issue.length; i++) {
			const item: any = json.Report.Issues.Project.Issue[i];
			addIssue(item);
		}
	} else {
		for (let i = 0; i < json.Report.Issues.Project.length; i++) {
			for (let j = 0; j < json.Report.Issues.Project[i].Issue.length; j++) {
				const item: any = json.Report.Issues.Project[i].Issue[j];
				addIssue(item);
			}
		}
	}

	return fileIssueLists;
}
