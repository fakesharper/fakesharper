export type Duplicate = {
	cost: number;
	fragment1: Fragment;
	fragment2: Fragment;
};

export type DuplicatesReport = {
	toolsVersion: string;
	statistics: Statistics;
	duplicates: Duplicate[];
};

export type Fragment = {
	filePath: string;
	fileName: string;
	offsetRange: Range;
	lineRange: Range;
};

export type Range = {
	start: number;
	end: number;
};

export type Statistics = {
	codebaseCost: number;
	totalDuplicatesCost: number;
	totalFragmentsCost: number;
};
