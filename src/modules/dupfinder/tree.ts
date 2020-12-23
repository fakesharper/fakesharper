import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME } from '../../constants';
import { DuplicatesReport, Duplicate } from './models';

export class DupfinderTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly fileName: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly childs: DupfinderTreeItem[]
	) {
		super(label, collapsibleState);

		this.description = path.basename(this.fileName);
		this.tooltip = this.fileName;
	}
}

export class DupfinderTreeDataProvider implements vscode.TreeDataProvider<DupfinderTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DupfinderTreeItem | undefined> = new vscode.EventEmitter<DupfinderTreeItem | undefined>();
	public readonly onDidChangeTreeData?: vscode.Event<DupfinderTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _duplicatesReport: DuplicatesReport | undefined = undefined;

	public set dataSource(dataSource: DuplicatesReport | undefined) {
		this._duplicatesReport = dataSource;
		this.refresh();
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	public getTreeItem(element: DupfinderTreeItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: DupfinderTreeItem | undefined): vscode.ProviderResult<DupfinderTreeItem[]> {
		if (this._duplicatesReport === undefined) {
			return null;
		}

		if (element === undefined) {
			return this._duplicatesReport.duplicates.map((duplicate, i) => this.createParentItem(duplicate, i));
		} else {
			return element.childs.length === 0 ? null : element.childs;
		}
	}

	private createParentItem(duplicate: Duplicate, index: number): DupfinderTreeItem {
		const childs = this.createFragmentItems(duplicate);
		const item = new DupfinderTreeItem(`[${index + 1}] Duplicate (Cost: ${duplicate.cost})`, '', vscode.TreeItemCollapsibleState.Expanded, childs);

		return item;
	}

	private createFragmentItems(duplicate: Duplicate): DupfinderTreeItem[] {
		const item1 = new DupfinderTreeItem('Fragment 1', duplicate.fragment1.fileName, vscode.TreeItemCollapsibleState.None, []);
		item1.command = {
			command: `${EXTENSION_NAME}.dupfinder.show`,
			title: 'Show duplicates',
			arguments: [duplicate.fragment1, duplicate.fragment2]
		};

		const item2 = new DupfinderTreeItem('Fragment 2', duplicate.fragment2.fileName, vscode.TreeItemCollapsibleState.None, []);
		item2.command = {
			command: `${EXTENSION_NAME}.dupfinder.show`,
			title: 'Show duplicates',
			arguments: [duplicate.fragment2, duplicate.fragment1]
		};

		return [item1, item2];
	}

	public getParent(node: DupfinderTreeItem): DupfinderTreeItem | null {
		return null;
	}
}
