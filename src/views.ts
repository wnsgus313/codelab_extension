

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

export function getChatWebviewContent(username: string, token: string, url: string)
{
  return `
  <!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>vsChat</title>
      <style>
         body,
         html, #app {
         width: 100%;
         height: 100%;
         overflow: hidden;
         }
         * {
         padding: 0;
         margin: 0;
         }
         iframe {
         width: 100%;
         height: 100%;
         overflow: hidden;
         border: none;
         }
      </style>
   </head>
   <body onload="loading()">
      <div id="app" style="display:none;">
        <div id="snow"></div>
        <iframe allowtransparency="true" src="${url}chat?token=${token}&username=${username}"
          frameborder="0"></iframe>
      </div>
      <script>
         // Loading screen
         var loadingScreen;
        function loading() {
          loadingScreen = setTimeout(showPage, 1000);
        }
        function showPage() {
          document.getElementById("app").style.display = "block";  
        }
        document.head.append(script);

      </script>
   </body>
</html>
	`;
}

export function getLogWebviewContent(url: string, username: unknown)
{
  return `
  <!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>vsChat</title>
      <style>
         body,
         html, #app {
         width: 100%;
         height: 100%;
         overflow: hidden;
         }
         * {
         padding: 0;
         margin: 0;
         }
         iframe {
         width: 100%;
         height: 100%;
         overflow: hidden;
         border: none;
         }
      </style>
   </head>
   <body onload="loading()">
      <div id="app" style="display:none;">
        <div id="snow"></div>
        <iframe allowtransparency="true" src="${url}/${username}"
          frameborder="0"></iframe>
      </div>
      <script>
         // Loading screen
         var loadingScreen;
        function loading() {
          loadingScreen = setTimeout(showPage, 1000);
        }
        function showPage() {
          document.getElementById("app").style.display = "block";  
        }
        document.head.append(script);

      </script>
   </body>
</html>
	`;
}