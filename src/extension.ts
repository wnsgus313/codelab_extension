import * as vscode from 'vscode';
import * as fs from 'fs';
import * as url from "url";
import * as mkdirp from "mkdirp";
import * as http from "http";
import * as https from "https";
import * as axios from "axios";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.downloadFile', () => {
		
		const configParams = vscode.workspace.getConfiguration('download-file'),
			defaultFolder = vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + configParams.get('defaultFolder') as string;
		
		vscode.window.showInputBox({ prompt: 'Enter file URL you wish to download' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter valid URL!");
			return;
		}
		fetchAndSaveFile(res, defaultFolder);
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.uploadProblem', () => {
		
		const configParams = vscode.workspace.getConfiguration('url'),
			url = configParams.get('uploadCode') as string;
		
		vscode.window.showInputBox({ prompt: 'Enter the problem ID you want to upload.' }).then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Please enter problem ID!");
			return;
		}
		uploadProblem(url+res, parseInt(res));
		});
	});
	context.subscriptions.push(disposable);
}

function uploadProblem(url:string, problemId:number) {
	const axios = require('axios');
	
	let code = fs.readFileSync('/Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/a.c', "binary");
	const files = {
		'filename': 'a.c',
		'file': code
	};
	console.log(code);
	axios.post(url, {files});

	// const timeout = 10000;
	// let req = http;
	// let opts = {
	// 	hostname: 'siskin21.cafe24.com', 
	// 	port: 80,
	// 	method: 'POST',
	// 	path: '/codelab/api/v1/problems/'+problemId,
	// };

	// console.log(url, problemId, opts);
	// let request = req.request(opts, function(response) {
	// 	console.log("in");
	// 	if (response.statusCode !== 200) {
	// 		vscode.window.showErrorMessage(`Upload problem ${url} failed`);
	// 	}

	// 	response.on("end", function(){
	// 		vscode.window.showInformationMessage(`Problem "${problemId}" upload successfully.`);
	// 	});


	// 	request.setTimeout(timeout, function () {
	// 		request.abort();
	// 	});
	// }).on('error', function(e) {
	// 	vscode.window.showErrorMessage(`Uploding ${problemId} failed! Please make sure URL is valid.`);
	// });

	// console.log(request);
}

function fetchAndSaveFile(fileURL:string, dest:string) {
	const timeout = 10000,
		urlParsed = url.parse(fileURL),
		uri = urlParsed.pathname.split('/');
	let req,
		filename = (uri[uri.length - 1].match(/(\w*\.?-?)+/))[0];

	if (urlParsed.protocol === null) {
		fileURL = 'http://' + fileURL;
	}

	req = (urlParsed.protocol === 'https:') ? https : http; 

	let request = req.get(fileURL, function(response) {
		
		// Make sure extension is present (mostly for images)
		if (filename.indexOf('.') < 0) {
			const contentType = response.headers['content-type'];
			filename += `.${contentType.split('/')[1]}`;
		}

		const targetPath = `${dest}/${filename}`;

		if (response.statusCode === 200) {

		mkdirp(dest, function(err: any) { 
			if (err) {
				throw err;
			}
			var file = fs.createWriteStream(targetPath);
			response.pipe(file);
		});

		} else {
			vscode.window.showErrorMessage(`Downloading ${fileURL} failed`);
		}

		response.on("end", function(){
			vscode.window.showInformationMessage(`File "${filename}" downloaded successfully.`);
		});

		request.setTimeout(timeout, function () {
			request.abort();
		});

	}).on('error', function(e) {
		vscode.window.showErrorMessage(`Downloading ${fileURL} failed! Please make sure URL is valid.`);
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
