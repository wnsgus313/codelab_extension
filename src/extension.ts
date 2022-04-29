import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { uploadProblem, fetchAndSaveProblem, deleteProblem, fetchProblemContent, fetchProblemList, fetchAndSaveCode, fetchProblemCode } from './problems';
import {submitCode} from './codes';
import {askUserForSave, changestatusFalse, changestatusTrue, logout} from './data';
import { Dependency, ReSolvedProblems, SolvedProblems, AllProblems } from './treeView';
import { VsChatProvider } from "./vsChatProvider";
import {uploadVideo} from "./videos";


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
	const videoUrl = 'api/v1/video/';
	const editJsonFile = require("edit-json-file");
	const home = process.env.HOME || process.env.USERPROFILE;

	const fileName = editJsonFile(`${home}/Library/Application\ Support/Code/User/settings.json`);


	let disposable = vscode.commands.registerCommand('extension.fetchAndSaveProblem', (item: vscode.TreeItem) => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url');
		// let url:string | undefined = configParamsUrl.get('problemsUrl') as string;
		
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		} 
		
		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		let res: any = item.label;

		fetchAndSaveProblem(url+res, res, workSpaceFolder + res, info);

		// url = configParamsUrl.get('contentUrl') as string;
		if (info.get('url')) {
			url = info.get('url') + contentUrl;
		} 
		fetchProblemContent(url+res);
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.saveExam', (item: vscode.TreeItem) => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url');
		// let url:string | undefined = configParamsUrl.get('problemsUrl') as string;

		let url: string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		}

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		let res: any = item.label;

		fetchAndSaveProblem(url + res, res, workSpaceFolder + res, info);

		// url = configParamsUrl.get('contentUrl') as string;
		if (info.get('url')) {
			url = info.get('url') + contentUrl;
		}
		fetchProblemContent(url + res);

		fileName.set("chronicler.dest-folder", workSpaceFolder + res);

		fileName.save();

		vscode.commands.executeCommand('chronicler.recordWithAudio');
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.saveStudentsCodes', (item: vscode.TreeItem) => {

		let url: string | undefined;
		if (info.get('url')) {
			url = info.get('url') + codesUrl;
		}

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		let res: any = item.label;

		vscode.window.showInformationMessage(res);

		// res는 문제 타이틀로 된 디렉토리 이름 -> 이 안에서 있는 모든 디렉토리 안에 들어가서 파일 다운 받아야함
		// fetchAndSaveCode(url + res, res, workSpaceFolder + res, info);

		// if (info.get('url')) {
		// 	url = info.get('url') + contentUrl;
		// }
		// fetchProblemCode(url + res);
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


	disposable = vscode.commands.registerCommand('extension.deleteProblem', (item: vscode.TreeItem) => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('problemsUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + problemsUrl;
		} 

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		let res: any = item.label;

		deleteProblem(url+res, res, info);
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('extension.submitCode', (item: vscode.TreeItem) => {
		// const configParamsUrl = vscode.workspace.getConfiguration('url'),
		// 	url = configParamsUrl.get('codesUrl') as string;
		let url:string | undefined;
		if (info.get('url')) {
			url = info.get('url') + codesUrl;
		}

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		let res: any = item.label;

		submitCode(url + '21700332/' + res, res, workSpaceFolder + res, info);
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
		submitCode(url + '21700332/' + res, res, workSpaceFolder + res, info);
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

		const allProvider = new AllProblems(rootPath);
		const solvedProvider = new SolvedProblems(rootPath);
		const resolvedProvider = new ReSolvedProblems(rootPath);
		vscode.window.registerTreeDataProvider('problem-all', allProvider);
		vscode.window.registerTreeDataProvider('problem-solve', solvedProvider);
		vscode.window.registerTreeDataProvider('problem-resolved', resolvedProvider);

		allProvider.refresh();
		solvedProvider.refresh();
		resolvedProvider.refresh();

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		await fetchProblemList(url, workSpaceFolder + '/problem_list.json', info);
		
		allProvider.refresh();
		solvedProvider.refresh();
		resolvedProvider.refresh();
	});
	context.subscriptions.push(disposable);

	let alreadyOpened = false;
	let previewMd = "";
	let closeOtherEditor = "";
	closeOtherEditor = "workbench.action.closeEditorsInOtherGroups"; // 이거 안하면 바로 닫힘
	previewMd = "markdown.showPreviewToSide";  // 미리보기로 보여주는 것
	function previewFirstMarkdown() {
		if (alreadyOpened) {
			return;
		}
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let doc = editor.document;
			if (doc && doc.languageId === "markdown") {
				openMarkdownPreviewSideBySide();
				alreadyOpened = true;
			}
		}
	}
	function openMarkdownPreviewSideBySide() {
		vscode.commands.executeCommand(closeOtherEditor)
			.then(() => vscode.commands.executeCommand(previewMd))
			// .then(() => closeExistingEditor())  // 미리보기 말고 그냥 md 파일 닫기
			.then(() => { }, (e) => console.error(e));
	}
	// function closeExistingEditor() {
	// 	vscode.commands.executeCommand("workbench.action.closeActiveEditor");
	// }

	if (vscode.window.activeTextEditor) {
		previewFirstMarkdown();
	} else {
		vscode.window.onDidChangeActiveTextEditor(() => {
			previewFirstMarkdown();
		});
	}

	vscode.workspace.onDidOpenTextDocument((doc) => {
		if (doc && doc.languageId === "markdown") {
			openMarkdownPreviewSideBySide();
		}
	});
	
	const vsChatSidebarProvider = new VsChatProvider(context.extensionUri, info);
	let sidebar = vscode.window.registerWebviewViewProvider(
		"codelabChat.view",
		vsChatSidebarProvider
	);
	
	context.subscriptions.push(sidebar);


	disposable = vscode.commands.registerCommand('extension.uploadExam', (item: vscode.TreeItem) => {
		let url: string | undefined;
		if (info.get('url')) {
			url = info.get('url') + videoUrl;
		}

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		let res: any = item.label;
		// vscode.commands.executeCommand("problemProvider.submitCode", res);

		uploadVideo(url + res, res, workSpaceFolder + res, info);

	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
