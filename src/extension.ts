import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {uploadProblem, fetchAndSaveProblem, deleteProblem, fetchProblemContent, fetchProblemList} from './problems';
import {submitCode} from './codes';
import {askUserForSave, changestatusFalse, changestatusTrue, logout} from './data';
import { ReSolvedProblems, SolvedProblems } from './treeView';


export function activate(context: vscode.ExtensionContext) {
	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;

	vscode.window.createTreeView('problem-resolved', {
		treeDataProvider: new SolvedProblems(rootPath),
	});

	vscode.window.createTreeView('problem-solve', {
		treeDataProvider: new ReSolvedProblems(rootPath),
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
		vscode.commands.registerCommand('extension.getInfo', async () => {
			await askUserForSave(info);

			await changestatusTrue(info);
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

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.logout', () => {
			logout(info);

			changestatusFalse(info);
		})
	);

	// problem list 새로고침
	disposable = vscode.commands.registerCommand('problemProvider.refreshProblems', async () => {
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemListUrl;
		}

		const solvedProvider = new SolvedProblems(rootPath);
		const resolvedProvider = new ReSolvedProblems(rootPath);
		vscode.window.registerTreeDataProvider('problem-solve', solvedProvider);
		vscode.window.registerTreeDataProvider('problem-resolved', resolvedProvider);

		solvedProvider.refresh();
		resolvedProvider.refresh();

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		await fetchProblemList(url, workSpaceFolder + '/problem_list.json', info);
		
		solvedProvider.refresh();
		resolvedProvider.refresh();
	});
	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {}


