import * as vscode from 'vscode';
import * as fs from 'fs';
import * as url from "url";
import * as axios from "axios";
import * as cheerio from "cheerio";
import * as path from "path";
import got from 'got';
import FormData = require('form-data');
import {getWebviewContent} from './views';



export async function uploadProblem(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	
	const token = await info.get('token');

	let fileLists:string[] = fs.readdirSync(targetPath);

	let filedata:string[] = [];
	let filename:string[] = [];
	fileLists.forEach((file) => {
		let reg = /(.*?)\.(pdf)$/;
        if (!file.match(reg)){
            filedata.push(fs.readFileSync(path.join(targetPath, file), "utf-8"));
			filename.push(file);
			console.log('pdf아닌거: ' + filename);
        }
	});

	let files = {
		'filename': filename,
		'file': filedata
	};

	axios.post(url, {files}, {auth: {username:token}})
	.then((res:any) => {
		vscode.window.showInformationMessage(`Problem upload successfully.`);
	}).catch((err:any) => {
		vscode.window.showErrorMessage(`Problem upload failed`);
	});

}

export async function uploadPdf(url:string, title:string, targetPath:string, info:vscode.Memento)
{
	const formData = new FormData();
    const token = await info.get('token');
    
    let fileLists:string[] = fs.readdirSync(targetPath);

    fileLists.forEach((file) => {
        let reg = /(.*?)\.(pdf|PDF)$/;
        if (file.match(reg)){
            formData.append('file', fs.createReadStream(path.join(targetPath, file)), file);
        }
	});

    const auth = 'Basic ' + Buffer.from(token + ':').toString('base64');

    try {
        let res = await got.post(url + '/pdf', {
            body: formData,
            headers: {
                "Authorization": auth
            }
        });
    
        vscode.window.showInformationMessage('Sucess upload video');
    } catch (e) {
        vscode.window.showErrorMessage(`Video upload failed`);
    }
}

export async function fetchAndSaveProblem(url:string, title:string, targetPath:string, info:vscode.Memento) {
	const axios = require('axios');
	console.log(targetPath);
	console.log (url);

	const token = await info.get('token');

	const auth = 'Basic ' + Buffer.from(token + ':').toString('base64');

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
			let reg = /(.*?)\.(pdf)$/;
			if (!filename.match(reg)){
				axios.get(url + '/' + filename, {auth: {username:token}})
				.then((res:any) => {
					fs.writeFileSync(saveFilePath, res.data);
				})
				.catch((err:any) => {
					vscode.window.showErrorMessage(`Fail save ${filename} in Problem ${title}`);
				});
			}
			else {
				downloadImage(url + '/' + filename + '.pdf', saveFilePath, auth);
			}
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

export async function fetchAndSaveCode(url: string, title: string, targetPath: string, info: vscode.Memento) {

	const axios = require('axios');

	const token = await info.get('token');

	let studentsId: string[] = [];

	let studentsEmail: string[] = [];
	
	axios.get(url, {auth: {username:token}})
	.then((res:any) => {
		if(!fs.existsSync(targetPath)){
			fs.mkdirSync(targetPath);
		}
		res.data['dir_list'].forEach(async (dirname:string) => {
			studentsId.push(dirname);
		});

		res.data['email_list'].forEach(async (email:string) => {
			studentsEmail.push(email);
		});
	})
	.then(() => {
		for (const student of studentsId) {
			axios.get(url + '/' + student, {auth: {username:token}})
			.then((res:any) => {
				for(const email of studentsEmail) {
					if(!fs.existsSync(targetPath + '/' + email)){
						fs.mkdirSync(targetPath + '/' + email);
					}
					res.data['file_list'].forEach((filename:string) => {
						const saveFilePath = targetPath + '/' + email + '/' + filename;
						axios.get(url + '/' + student + '/' + filename, {auth: {username:token}})
						.then((res:any) => {
							fs.writeFileSync(saveFilePath, res.data);
							vscode.window.showInformationMessage(`${filename} save successfully.`);
						})
						.catch((err:any) => {
							vscode.window.showErrorMessage(`Fail save ${filename} in Problem ${title}/${email}`);
						});
					});
				}
			}).catch((err:any) => {
				vscode.window.showErrorMessage(`Please check Problem Id : --2--${title}`);
			});
		}
	})
	.catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : --- ${title} ---`);
	});
}


async function downloadImage(url: any, saveFilePath:any, token: any) {
	const fs = require('fs');
	const path = require('path');
	const axios = require('axios');

	const path2 = path.resolve(saveFilePath);
	const writer = fs.createWriteStream(path2);

	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream',
		headers: {
			"Authorization": token
		}
	});

	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}

export async function downloadVideo(url: string, title: string, targetPath: string, info: vscode.Memento) {

	const axios = require('axios');

	const token = await info.get('token');

	const auth = 'Basic ' + Buffer.from(token + ':').toString('base64');

	let studentsId: string[] = [];

	let studentsEmail: string[] = [];
	
	axios.get(url, {auth: {username:token}})
	.then((res:any) => {
		if(!fs.existsSync(targetPath)){
			fs.mkdirSync(targetPath);
		}
		res.data['dir_list'].forEach(async (dirname:string) => {
			studentsId.push(dirname);
		});

		res.data['email_list'].forEach(async (email:string) => {
			studentsEmail.push(email);
		});
	})
	.then(() => {
		for (const student of studentsId) {
			axios.get(url + '/' + student, {auth: {username:token}})
			.then((res:any) => {
				for(const email of studentsEmail) {
					if(!fs.existsSync(targetPath + '/video')){
						fs.mkdirSync(targetPath + '/video');
					}
					res.data['file_list'].forEach((filename:string) => {
						const saveFilePath = targetPath + '/video/' + filename;
						axios.get(url + '/' + student + '/' + filename, {auth: {username:token}})
						.then((res:any) => {
							downloadImage(url + '/' + student + '/' + filename, saveFilePath, auth);
							vscode.window.showInformationMessage(`${filename} save successfully.`);
						})
						.catch((err:any) => {
							vscode.window.showErrorMessage(`Fail save ${filename} in Problem ${title}/${email}`);
						});
					});
				}
			}).catch((err:any) => {
				vscode.window.showErrorMessage(`Please check Problem Id : --543--${title}`);
			});
		}
	})
	.catch((err:any) => {
		vscode.window.showErrorMessage(`Please check Problem Id : 555--- ${title} ---`);
	});
}