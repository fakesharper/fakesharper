export type IssueType = {
	id: string;
	category: string;
	categoryId: string;
	description: string;
	severity: 'ERROR' | 'HINT' | 'INFORMATION' | 'SUGGESTION' | 'WARNING';
	wikiUrl: string | undefined;
};

export type Ofset = {
	start: number;
	end: number;
};

export type Issue = {
	typeId: string;
	file: string;
	offset: Ofset;
	line: number;
	message: string;

	issueType: IssueType;
};

export type File = {
	path: string;
	issues: Issue[];
};
