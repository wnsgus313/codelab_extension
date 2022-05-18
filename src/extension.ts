import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { uploadProblem, fetchAndSaveProblem, deleteProblem, fetchProblemList, fetchAndSaveCode, uploadPdf, downloadVideo } from './problems';
import {submitCode} from './codes';
import {askUserForSave, changestatusFalse, changestatusTrue, logout, inputRoomName, inputRoomName2, deleteRoomName, inputStudentEmail, saveToken} from './data';
import { Dependency, ReSolvedProblems, SolvedProblems, AllProblems } from './treeView';
import { VsChatProvider } from "./vsChatProvider";
import {uploadVideo} from "./videos";
import {getLogWebviewContent, getFirstWebview, getChatWebviewContent} from './views';
import { table } from 'console';

let endFlag = false;

export function activate(context: vscode.ExtensionContext) {
	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;

	vscode.commands.executeCommand('extension.firstView');

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
	const labUrl = 'api/v1/labs';

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

		fetchAndSaveProblem(url + 'DS/' + res, res, workSpaceFolder + 'DS/' + res, info);

	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.saveExam', (item: vscode.TreeItem) => {

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		let res: any = item.label;

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

		// let res: any = item.label;

		// res는 문제 타이틀로 된 디렉토리 이름 -> 이 안에서 있는 모든 디렉토리 안에 들어가서 파일 다운 받아야함
		fetchAndSaveCode(url + 'DS/Bracket', 'Bracket', workSpaceFolder + 'DS/Bracket', info);

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
		uploadProblem(url + 'DS/' + res, res, workSpaceFolder + 'DS/' + res, info);
		uploadPdf(url + 'DS/' + res, res, workSpaceFolder + 'DS/' + res, info);
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
		
		// let res: any = item.label;

		deleteProblem(url + 'DS/' + 'Bracket', 'Bracket', info);
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
		
		// let res: any = item.label;

		submitCode(url + 'DS/' + 'Bracket', 'Bracket', workSpaceFolder + 'DS/Bracket', info);
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
			console.log(info.get('username'));
			console.log(info.get('role'));
			console.log(info.get('room'));
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
	
	// const vsChatSidebarProvider = new VsChatProvider(context.extensionUri, info);
	// let sidebar = vscode.window.registerWebviewViewProvider(
	// 	"codelabChat.view",
	// 	vsChatSidebarProvider
	// );
	
	// context.subscriptions.push(sidebar);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.chatroom', () => {
		  // Create and show panel
		  const panel = vscode.window.createWebviewPanel(
			'chatroom',
			'Chat Room',
			vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
                enableFindWidget: true,
            }
		  );

		  let username = info.get('username');
		  let url = info.get('url');
		  const token = info.get('token');
		  let lab = 'DS';
		  // And set its HTML content
		  panel.webview.html = getChatWebviewContent(url, lab, token, username);
		})
	  );


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

	let bae: any;

	let saveOne: any;

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.sendText', () => {
			let editor: vscode.TextEditor | undefined;
			editor = vscode.window.activeTextEditor;
			let minuteOne = '0';
			let oneMinute = 0;
			
			let curr = vscode.workspace;

			// detect one keyboard
			curr.onDidChangeTextDocument((e) => {
				if (e.contentChanges.length >= 1) {
					oneMinute++; 
					minuteOne = oneMinute.toString(); 
				}
			});
			endFlag = true;
			bae = setInterval(()=>startTraining(editor?.document.getText(), minuteOne, info), 4000);
			saveOne = editor?.document.getText();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.stopText', () => {

			endFlag = false;

			clearInterval(bae);

			let url = info.get('url') + 'api/v1/logs';

			const axios = require('axios');
			const token = info.get('token');

			let logs = {
				'flag': 1,
				'code': 'The End',
				'length': 0
			};

			axios.post(url, logs, {auth: {username:token}})
			.then((res:any) => {
				vscode.window.showInformationMessage(`Problem upload successfully.`);
			}).catch((err:any) => {
				vscode.window.showErrorMessage(`Problem upload failed`);
			});

			vscode.window.showInformationMessage('End Practice');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.viewLog', () => {
		  // Create and show panel
		  const panel = vscode.window.createWebviewPanel(
			'viewLog',
			'View Log',
			vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
                enableFindWidget: true,
            }
		  );

		  const token = info.get('token');

		  let url = info.get('url') + 'DS/' + 'practice';
		  // And set its HTML content
		  panel.webview.html = getLogWebviewContent(url, token);
		})
	  );
	
	disposable = vscode.commands.registerCommand('extension.makeLab', async (item: vscode.TreeItem) => {

		const axios = require('axios');

		let labName: any = await inputRoomName();

		let url = info.get('url') + labUrl;

		let token = info.get('token');

		let sendName = {
			'labName': labName
		};

		axios.post(url, sendName, {auth: {username:token}})
		.then((res:any) => {
			vscode.window.showInformationMessage(`Make Lab successfully.`);
			vscode.commands.executeCommand('extension.getLabs');
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Make Lab failed`);
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.getLabs', async (item: vscode.TreeItem) => {

		saveToken(info);

		const axios = require('axios');

		let url = info.get('url') + labUrl;

		let token = info.get('token');

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

		axios.get(url, {auth: {username:token}})
		.then((res:any) => {
			fs.writeFileSync(path.join(workSpaceFolder, 'labs.json'), JSON.stringify(res.data));
			// fs.writeFileSync(workSpaceFolder, JSON.stringify(res.data));
			// vscode.window.showInformationMessage(JSON.stringify(res.data));
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Get Lab fail 2`);
		});

	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.deleteLab', async (item: vscode.TreeItem) => {

		const axios = require('axios');

		let url = info.get('url') + labUrl + '/delete';

		let token = info.get('token');

		let deleteLab: any = await deleteRoomName();

		let sendName = {
			'deleteLab': deleteLab
		};

		vscode.window.showInformationMessage(`Do you want to delete ${deleteLab} ?`, "Yes", "No")
  		.then(answer => {
    		if (answer === "Yes") {
				axios.post(url, sendName, {auth: {username:token}})
				.then((res:any) => {
					vscode.window.showInformationMessage(`Delete Lab successfully.`);
					vscode.commands.executeCommand('extension.getLabs');
					saveToken(info);
				}).catch((err:any) => {
					vscode.window.showErrorMessage(`Delete Lab failed`);
				});
    		}
			else {
				vscode.window.showInformationMessage("Exit");
			}
  		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.addStudent2Lab', async (item: vscode.TreeItem) => {

		const axios = require('axios');

		let token = info.get('token');

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		// let res: any = item.label;

		let room = await inputRoomName2();

		let email = await inputStudentEmail();

		let url = info.get('url') + 'api/v1/invite';

		let sendInfo = {
			'email': email,
			'lab': room
		};

		axios.post(url, sendInfo, {auth: {username:token}})
		.then((res:any) => {
			vscode.window.showInformationMessage(`Success to add ${email} to ${room}`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Fail to add ${email} to ${room}`);
		});


	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.addTA', async (item: vscode.TreeItem) => {
		
		const axios = require('axios');

		let token = info.get('token');

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		// let res: any = item.label;

		let room = await inputRoomName2();

		let email = await inputStudentEmail();

		let url = info.get('url') + 'api/v1/inviteTA';

		let sendInfo = {
			'email': email,
			'lab': room
		};

		axios.post(url, sendInfo, {auth: {username:token}})
		.then((res:any) => {
			vscode.window.showInformationMessage(`Success to add ${email} to ${room}'s TA and invite to ${room}`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Fail to add ${email} to ${room}'s TA`);
		});
		
	});
	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.firstView', () => {
		  // Create and show panel
		  const panel = vscode.window.createWebviewPanel(
			'firstView',
			'Welcome CodeLabHub',
			vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
                enableFindWidget: true,
            }
		  );

		  const axios = require('axios');

		  let token = info.get('token');

		  let username = info.get('username');
		  let url = 'http://siskin21.cafe24.com/codelab/firstView';

		  axios.get(url, {auth: {username:token}})
		  .then((res:any) => {
			  // And set its HTML content
			  panel.webview.html = getFirstWebview(res.data['users']);
			}).catch((err:any) => {
				vscode.window.showErrorMessage(`Start Error`);
			});

		})
	  );

	  disposable = vscode.commands.registerCommand('extension.saveVideos', (item: vscode.TreeItem) => {

		let url: string | undefined;
		if (info.get('url')) {
			url = info.get('url') + videoUrl;
		}

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';

		let res: any = item.label;

		// res는 문제 타이틀로 된 디렉토리 이름 -> 이 안에서 있는 모든 디렉토리 안에 들어가서 파일 다운 받아야함
		downloadVideo(url + res, res, workSpaceFolder + res, info);

		// if (info.get('url')) {
		// 	url = info.get('url') + contentUrl;
		// }
		// fetchProblemCode(url + res);
	});
	context.subscriptions.push(disposable);


}


// this method is called when your extension is deactivated
export function deactivate() {}

export async function startTraining(send: any, minuteOne: any, info: any) {

	if (endFlag === true)
	{

		let url = info.get('url') + 'api/v1/logs';

		const axios = require('axios');
		const token = info.get('token');

		minuteOne = Number(minuteOne);

		let logs = {
			'flag': 0,
			'code': send,
			'length': minuteOne
		};

		axios.post(url, logs, {auth: {username:token}})
		.then((res:any) => {
			vscode.window.showInformationMessage(`Problem upload successfully.`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Problem upload failed`);
		});
	}		
}
