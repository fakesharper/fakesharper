import * as fs from 'fs';
import * as fxp from 'fast-xml-parser';
import * as path from 'path';
import { IssueType, Issue } from "./models";

/**
 * Returns string of xml file
 * @param path xml file path
 */
export function readXml(path: string): string {
	return fs.readFileSync(path).toString();
}

/**
 * Returns Issue array in xml file
 * @param basePath *.sln or *.csproj file directory path
 * @param xml xml string data
 */
export function parsefile(xmlPath: string): Issue[] {
	const xml: string = readXml(xmlPath);

	const json: any = fxp.parse(xml, {
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
			file: item.attributes["@_File"],
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

	return issues;
}
