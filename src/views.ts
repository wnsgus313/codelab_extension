

export function getWebviewContent(title:string, name:string, body:string) {
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