import * as vscode from 'vscode';
import * as fs from 'fs';
import * as url from "url";
import * as axios from "axios";
import * as cheerio from "cheerio";
import { getVSCodeDownloadUrl } from '@vscode/test-electron/out/util';
import { stringify } from 'querystring';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.fetchAndSaveProblem', () => {
		
		const configParamsUrl = vscode.workspace.getConfiguration('url');
		let url = configParamsUrl.get('problemsUrl') as string;
		
		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		vscode.window.showInputBox({ prompt: 'Enter file URL you wish to download' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}

		fetchAndSaveProblem(url+res, res, workSpaceFolder + res);

		url =  configParamsUrl.get('contentUrl') as string;
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
}

function uploadProblem(url:string, title:string, targetPath:string) {
	const axios = require('axios');
	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/1

	let fileLists:string[] = fs.readdirSync(targetPath);

	let files = {
		'filename': '',
		'file': ''
	};

	console.log(fileLists); // ['a.c', 'a.py', 'a.txt', 'b.c', 'main.c']

	fileLists.forEach((file) => {
		files['filename'] = file;
		files['file'] = fs.readFileSync(targetPath+'/'+file, "binary");

		axios.post(url, {files})
		.then((res:any) => {
			vscode.window.showInformationMessage(`${file} upload successfully.`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Upload ${file} failed`);
		});
	});
}

function fetchAndSaveProblem(url:string, title:string, targetPath:string) {
	const axios = require('axios');
	console.log(targetPath);
	console.log (url);

	if (fs.existsSync(targetPath)){
		return;
	}

	axios.get(url)
	.then((res:any) => {
		if(!fs.existsSync(targetPath)){
			fs.mkdirSync(targetPath);
		}

		res.data['file_list'].forEach((filename:string) => {
			const saveFilePath = targetPath + '/' + filename;
			axios.get(url + '/' + filename)
			.then((res:any) => {
				fs.writeFileSync(saveFilePath, res.data);
				vscode.window.showInformationMessage(`${filename} save successfully.`);
			})
			.catch((err:any) => {
				vscode.window.showErrorMessage(`Fail save ${filename} in Problem ${title}`);
			});
		});

	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : ${title}`);
	});
}

function deleteProblem(url:string, title:string) {
	const axios = require('axios');

	axios.delete(url)
	.then((res:any) => {
		vscode.window.showInformationMessage(`${title} delete successfully.`);
	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : ${title}`);
	});
}

function submitCode(url:string, title:string, targetPath:string) {
	const axios = require('axios');
	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/1
	console.log(url);

	let fileLists:string[] = fs.readdirSync(targetPath);

	let files = {
		'filename': '',
		'file': ''
	};

	console.log(fileLists); // ['a.c', 'a.py', 'a.txt', 'b.c', 'main.c']

	fileLists.forEach((file) => {
		files['filename'] = file;
		files['file'] = fs.readFileSync(targetPath+'/'+file, "binary");

		axios.post(url, {files})
		.then((res:any) => {
			vscode.window.showInformationMessage(`${file} upload successfully.`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Upload ${file} failed`);
		});
	});
}


async function fetchProblemContent(url: string) {
	const axios = require('axios');
	console.log(url);

	const res = await axios.get(url);
	const data = res.data;
	const $ = cheerio.load(data);
	const title = $('#title').text(), name = $('#name').text(), body = $('#body').text();

	const panel = vscode.window.createWebviewPanel(
		'problemContent',
		title,
		vscode.ViewColumn.Beside,
		{}
	);
	
	panel.webview.html = getWebviewContent(title, name, body);
}
function getWebviewContent(title:string, name:string, body:string) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${title}</title>
	</head>
	<body>
		<h2>[${title}] ${name}</h2>
		<p>${body}</p>
	</body>
	</html>`;
	}


// this method is called when your extension is deactivated
export function deactivate() {}