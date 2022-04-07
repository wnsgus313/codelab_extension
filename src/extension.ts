import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {uploadProblem, fetchAndSaveProblem, deleteProblem, fetchProblemContent, fetchProblemList} from './problems';
import {submitCode} from './codes';
import {askUserForSave} from './data';


export function activate(context: vscode.ExtensionContext) {
	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;

	vscode.window.createTreeView('solved', {
		treeDataProvider: new SolvedProblems(rootPath),
	});

	const info = context.globalState;
	const problemsUrl = 'api/v1/problems/';
	const codesUrl = 'api/v1/student_codes/';
	const contentUrl = 'problems/';
	const problemListUrl = 'api/v1/problems/list';

	let disposable = vscode.commands.registerCommand('extension.fetchAndSaveProblem', () => {
		
		// const configParamsUrl = vscode.workspace.getConfiguration('url');
		// let url:string | undefined = configParamsUrl.get('problemsUrl') as string;
		
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		} 
		
		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		vscode.window.showInputBox({ prompt: 'Enter file URL you wish to download' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}

		fetchAndSaveProblem(url+res, res, workSpaceFolder + res, info);

		// url = configParamsUrl.get('contentUrl') as string;
		if (info.get('url')) {
			url = info.get('url') + contentUrl;
		} 
		fetchProblemContent(url+res);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.uploadProblem', () => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('problemsUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		uploadProblem(url+res, res, workSpaceFolder + res, info);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.deleteProblem', () => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('problemsUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to delete.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		deleteProblem(url+res, res, info);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.submitCode', () => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('codesUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + codesUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to code upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		submitCode(url + '21700332/' + res, res, workSpaceFolder + res);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.codelabSignUp', () => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('rootUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url');
		} 
		
		if (url) {vscode.env.openExternal(vscode.Uri.parse(url));}
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.codelabLogin', () => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('codesUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + codesUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to code upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		submitCode(url + '21700332/' + res, res, workSpaceFolder + res);
		});
	});
	context.subscriptions.push(disposable);


	context.subscriptions.push(
		vscode.commands.registerCommand('extension.getInfo', () => {

			askUserForSave(info);

		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.printInfo', () => {
			console.log(info.get('url'));
			console.log(info.get('email'));
			console.log(info.get('password'));
			console.log(info.get('token'));
		})
	);


	// problem list 새로고침
	disposable = vscode.commands.registerCommand('problemProvider.refreshProblems', () => {
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemListUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		fetchProblemList(url, workSpaceFolder + '/problem_list.json', info);
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


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

class Dependency extends vscode.TreeItem {
	constructor(
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(version, collapsibleState);
		this.tooltip = `${this.version}`;
	}
}