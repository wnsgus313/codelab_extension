import * as vscode from 'vscode';
import * as fs from 'fs';
import * as url from "url";
import * as axios from "axios";
import * as cheerio from "cheerio";

import {getWebviewContent} from './views';

export async function uploadProblem(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/1

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

export async function fetchAndSaveProblem(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	console.log(targetPath);
	console.log (url);

	const token = await info.get('token');

	if (fs.existsSync(targetPath)){
		return;
	}

	axios.get(url, {auth: {username:token}})
	.then((res:any) => {
		if(!fs.existsSync(targetPath)){
			fs.mkdirSync(targetPath);
		}

		res.data['file_list'].forEach((filename:string) => {
			const saveFilePath = targetPath + '/' + filename;
			axios.get(url + '/' + filename, {auth: {username:token}})
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

export async function deleteProblem(url:string, title:string, info:vscode.Memento) {
	const axios = require('axios');

	const token = await info.get('token');

	axios.delete(url, {auth: {username:token}})
	.then((res:any) => {
		vscode.window.showInformationMessage(`${title} delete successfully.`);
	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : ${title}`);
	});
}

// 문제 content 가져오기
export async function fetchProblemContent(url: string) {
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

export async function fetchProblemList(url: string | undefined, targetPath: string, info: any) {
	const axios = require('axios');
	const token = await info.get('token');

	axios.get(url, {auth: {username:token}})
	.then((res:any) => {
		console.log(JSON.stringify(res.data));
		fs.writeFileSync(targetPath, JSON.stringify(res.data));

	}).catch((err:any) => {
		vscode.window.showErrorMessage(`fetch problem list failed!`);
	});
}
