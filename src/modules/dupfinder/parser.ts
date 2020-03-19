import * as fxp from 'fast-xml-parser';
import * as file from '../../file';
import { Duplicate, DuplicatesReport } from "./models";

export function parsefile(path: string): DuplicatesReport {
	const xml: string = file.readFileSync(path);

	const json: any = fxp.parse(xml, {
		attrNodeName: 'attributes',
		ignoreAttributes: false,
		parseAttributeValue: true
	});

	const report: DuplicatesReport = {
		toolsVersion: json.DuplicatesReport.attributes["@_ToolsVersion"],
		statistics: {
			codebaseCost: parseInt(json.DuplicatesReport.Statistics.CodebaseCost),
			totalDuplicatesCost: parseInt(json.DuplicatesReport.Statistics.TotalDuplicatesCost),
			totalFragmentsCost: parseInt(json.DuplicatesReport.Statistics.TotalFragmentsCost)
		},
		duplicates: []
	};

	// TODO: Test for 0 and 1 duplicate.
	for (let i = 0; i < json.DuplicatesReport.Duplicates.Duplicate.length; i++) {
		const duplicate: Duplicate = {
			cost: parseInt(json.DuplicatesReport.Duplicates.Duplicate[i].attributes["@_Cost"]),
			fragment1: {
				filePath: '',
				fileName: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[0].FileName,
				offsetRange: {
					start: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[0].OffsetRange.attributes["@_Start"],
					end: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[0].OffsetRange.attributes["@_End"]
				},
				lineRange: {
					start: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[0].LineRange.attributes["@_Start"],
					end: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[0].LineRange.attributes["@_End"]
				}
			},
			fragment2: {
				filePath: '',
				fileName: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[1].FileName,
				offsetRange: {
					start: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[1].OffsetRange.attributes["@_Start"],
					end: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[1].OffsetRange.attributes["@_End"]
				},
				lineRange: {
					start: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[1].LineRange.attributes["@_Start"],
					end: json.DuplicatesReport.Duplicates.Duplicate[i].Fragment[1].LineRange.attributes["@_End"]
				}
			}
		};

		report.duplicates.push(duplicate);
	}

	report.duplicates = report.duplicates.sort((x, y) => y.cost - x.cost);

	return report;
}
