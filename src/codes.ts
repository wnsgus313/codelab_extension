import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {getWebviewContent} from './views';

export async function submitCode(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/1
	console.log(url);

	const token = await info.get('token');

	let fileLists:string[] = fs.readdirSync(targetPath);

	console.log(fileLists); // ['a.c', 'a.py', 'a.txt', 'b.c', 'main.c']

	let filedata:string[] = [];
	let filename:string[] = [];
	fileLists.forEach((file) => {
		filedata.push(fs.readFileSync(path.join(targetPath, file), "utf-8"));
		filename.push(file);

		// files['filename'] = file;
		// files['file'] = fs.readFileSync(targetPath+'/'+file, "utf-8");
	});

	let files = {
		'filename': filename,
		'file': filedata,
	};

	console.log(filename); // ['a.c', 'a.py', 'a.txt', 'b.c', 'main.c']

	await axios.delete(url, {auth: {username:token}})
	.then((res:any) =>{

	}).catch((err:any) => {
		
	});

	axios.post(url, {files}, {auth: {username:token}})
	.then((res:any) => {
		vscode.window.showInformationMessage(res.data['message']);
	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Code upload failed`);
	});
}