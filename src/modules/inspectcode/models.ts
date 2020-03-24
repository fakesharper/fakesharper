export type File = {
	path: string;
	issues: Issue[];
};

export type Issue = {
	typeId: string;
	file: string;
	offset: Range;
	line: number;
	message: string;

	issueType: IssueType;
};

export type IssueType = {
	id: string;
	category: string;
	categoryId: string;
	description: string;
	severity: 'ERROR' | 'HINT' | 'INFORMATION' | 'SUGGESTION' | 'WARNING';
	wikiUrl: string | undefined;
};

export type Range = {
	start: number;
	end: number;
};
