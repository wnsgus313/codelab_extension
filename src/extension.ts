import * as vscode from 'vscode';
import * as fs from 'fs';
import * as url from "url";
import * as mkdirp from "mkdirp";
import * as http from "http";
import * as https from "https";
import * as axios from "axios";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.fetchAndSaveProblem', () => {
		
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('codeUrl') as string;
		
		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		vscode.window.showInputBox({ prompt: 'Enter file URL you wish to download' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		fetchAndSaveProblem(url+res, parseInt(res), workSpaceFolder + res);
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.uploadProblem', () => {
		
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('codeUrl') as string;

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		uploadProblem(url+res, parseInt(res), workSpaceFolder + res);
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.deleteProblem', () => {
		
		const configParamsUrl = vscode.workspace.getConfiguration('url'),
			url = configParamsUrl.get('codeUrl') as string;

		const configParamsWS = vscode.workspace.getConfiguration('workspace'),
			workSpaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to delete.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		deleteProblem(url+res, parseInt(res));
		});
	});
	context.subscriptions.push(disposable);
}

function uploadProblem(url:string, problemId:number, targetPath:string) {
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

function fetchAndSaveProblem(url:string, problemId:number, targetPath:string) {
	const axios = require('axios');
	console.log(targetPath);

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
				vscode.window.showErrorMessage(`Fail save ${filename} in Problem ${problemId}`);
			});
		});

	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : ${problemId}`);
	});
}

function deleteProblem(url:string, problemId:number) {
	const axios = require('axios');

	axios.delete(url)
	.then((res:any) => {
		vscode.window.showInformationMessage(`${problemId} delete successfully.`);
	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : ${problemId}`);
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
