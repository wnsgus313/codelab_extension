import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export class SolvedProblems implements vscode.TreeDataProvider<Dependency> {
	constructor(private workspaceRoot: string) { }

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(
				this.getDepsInPackageJson(
					path.join(this.workspaceRoot, 'node_modules', 'problem_list.json')
				)
			);
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'problem_list.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no problem_list.json');
				return Promise.resolve([]);
			}
		}
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string, version: string): Dependency => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules'))) {
					return new Dependency(
						version,
						vscode.TreeItemCollapsibleState.Collapsed
					);
				} else {
					return new Dependency(version, vscode.TreeItemCollapsibleState.None);
				}
			};

			const deps = packageJson.Solved_Problems
				? Object.keys(packageJson.Solved_Problems).map(dep =>
					toDep(dep, packageJson.Solved_Problems[dep])
				)
				: [];
			return deps;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

}

export class ReSolvedProblems implements vscode.TreeDataProvider<Dependency> {
	constructor(private workspaceRoot: string) { }

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(
				this.getDepsInPackageJson(
					path.join(this.workspaceRoot, 'node_modules', 'problem_list.json')
				)
			);
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'problem_list.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no problem_list.json');
				return Promise.resolve([]);
			}
		}
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string, version: string): Dependency => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules'))) {
					return new Dependency(
						version,
						vscode.TreeItemCollapsibleState.Collapsed
					);
				} else {
					return new Dependency(version, vscode.TreeItemCollapsibleState.None);
				}
			};

			const deps = packageJson.Resolved_Problems
				? Object.keys(packageJson.Resolved_Problems).map(dep =>
					toDep(dep, packageJson.Resolved_Problems[dep])
				)
				: [];
			return deps;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

}

export class AllProblems implements vscode.TreeDataProvider<Dependency> {
	constructor(private workspaceRoot: string) { }

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(
				this.getDepsInPackageJson(
					path.join(this.workspaceRoot, 'node_modules', 'problem_list.json')
				)
			);
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'problem_list.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no problem_list.json');
				return Promise.resolve([]);
			}
		}
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string, version: string): Dependency => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules'))) {
					return new Dependency(
						version,
						vscode.TreeItemCollapsibleState.Collapsed
					);
				} else {
					return new Dependency(version, vscode.TreeItemCollapsibleState.None);
				}
			};

			const deps = packageJson.All_Problems
				? Object.keys(packageJson.All_Problems).map(dep =>
					toDep(dep, packageJson.All_Problems[dep])
				)
				: [];
			return deps;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

}

export class Dependency extends vscode.TreeItem {
	constructor(
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(version, collapsibleState);
		this.tooltip = `${this.version}`;
	}
}