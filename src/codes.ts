import * as vscode from 'vscode';
import * as fs from 'fs';

import {getWebviewContent} from './views';

export async function submitCode(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/1
	console.log(url);

	const token = await info.get('token');
	let fileLists:string[] = fs.readdirSync(targetPath);

	let files = {
		'filename': '',
		'file': ''
	};

	console.log(fileLists); // ['a.c', 'a.py', 'a.txt', 'b.c', 'main.c']

	fileLists.forEach((file) => {
		files['filename'] = file;
		files['file'] = fs.readFileSync(targetPath+'/'+file, "utf-8");

		axios.post(url, {files}, {auth: {username:token}})
		.then((res:any) => {
			vscode.window.showInformationMessage(`${file} upload successfully.`);
		}).catch((err:any) => {
			vscode.window.showErrorMessage(`Upload ${file} failed`);
		});
	});
}