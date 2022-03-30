import * as vscode from 'vscode';
import * as fs from 'fs';

import {uploadProblem, fetchAndSaveProblem, deleteProblem, fetchProblemContent} from './problems';
import {submitCode} from './codes';
import {askUserUrl, askUserForEmail, askUserForPassword, askUserForSave} from './data';


export function activate(context: vscode.ExtensionContext) {

	const info = context.globalState;

	let disposable = vscode.commands.registerCommand('extension.fetchAndSaveProblem', () => {
		
		// const configParamsUrl = vscode.workspace.getConfiguration('url');
		// let url:string | undefined = configParamsUrl.get('problemsUrl') as string;
		
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + '/api/v1/problems/';
		} 
		
		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		vscode.window.showInputBox({ prompt: 'Enter file URL you wish to download' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}

		fetchAndSaveProblem(url+res, res, workSpaceFolder + res);

		// url = configParamsUrl.get('contentUrl') as string;
		if (info.get('url')) {
			url = info.get('url') + '/problems/';
		} 
		fetchProblemContent(url+res);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.uploadProblem', () => {
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('problemsUrl') as string;

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		uploadProblem(url+res, res, workSpaceFolder + res);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.deleteProblem', () => {
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('problemsUrl') as string;

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to delete.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		deleteProblem(url+res, res);
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.submitCode', () => {
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('codesUrl') as string;

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


	disposable = vscode.commands.registerCommand('extension.codelabAuthentication', () => {
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('rootUrl') as string;
		
		if (url) {vscode.env.openExternal(vscode.Uri.parse(url));}
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.codelabLogin', () => {
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('codesUrl') as string;

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
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}