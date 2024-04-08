import fs from "fs";

function getAllFilesInsideDir(dir, filesToCopy = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (fs.lstatSync(`${dir}/${file}`).isDirectory()) {
      const result = getAllFilesInsideDir(`${dir}/${file}`);
      filesToCopy.push(...result);
      return;
    }
    filesToCopy.push(`${dir}/${file}`);
  });
  return filesToCopy;
}

const envProduction = fs.readFileSync("./.env.production", "utf8");
let viteApiUrl = envProduction.split("\n").find((line) => line.startsWith("VITE_API_URL"));
viteApiUrl = viteApiUrl? viteApiUrl.split("=")[1]: "";
if (!viteApiUrl) {
  throw new Error("VITE_API_URL not found in .env.production");
}
const URL_BASE = viteApiUrl.replace(/"/g, "").trim() + "/assistant/assets";

const assetFiles = fs.readdirSync("dist/assets");
const cssFiles = assetFiles.filter((file) => file.endsWith(".css")).map((file) => `${URL_BASE}/${file}`);
const jsFiles = assetFiles.filter((file) => file.endsWith(".js")).map((file) => `${URL_BASE}/${file}`);
const files = {
  css: cssFiles,
  js: jsFiles,
}

let content = JSON.stringify(files);
// scape the quotes
content = content.replace(/"/g, '\\"');
const appFile = fs.readFileSync("public/app.js", "utf8");
const appFileContent = appFile.replace("/** TEMPLATE DATA **/", content);
fs.writeFileSync("dist/app.js", appFileContent);

// copy directory and all files from ./dist to ../system/public/assistant
if (fs.existsSync("../system/public/assistant")) {
  fs.rmSync("../system/public/assistant", { recursive: true });
}
fs.mkdirSync("../system/public/assistant/assets", { recursive: true, mode: 0o755 });

// get js file inside dist/assets and replace the /assets/ with viteApiUrl/assets/
const jsFilesToReplace = fs.readdirSync("dist/assets").filter((file) => file.endsWith(".js"));
jsFilesToReplace.forEach((file) => {
  let jsFile = fs.readFileSync(`dist/assets/${file}`, "utf8");
  jsFile = jsFile.replace(/\/assets\//g, `${URL_BASE}/`);
  fs.writeFileSync(`dist/assets/${file}`, jsFile);
});

const filesToCopy = getAllFilesInsideDir("dist");
filesToCopy.forEach((file) => {
  const finalFile = file.replace(/^dist\//, '');
  if (fs.lstatSync(file).isDirectory()) {
    fs.mkdirSync(`../system/public/assistant/${finalFile}`, { recursive: true, mode: 0o755 });
    return;
  }
  fs.copyFileSync(file, `../system/public/assistant/${finalFile}`);
});

// open dist/index.html and replace href="/ and src="/ with href="/assistant/ and src="/assistant/
let indexHtml = fs.readFileSync("dist/index.html", "utf8");
indexHtml = indexHtml.replace(/href="\//g, 'href="/assistant/');
indexHtml = indexHtml.replace(/src="\//g, 'src="/assistant/');
fs.writeFileSync("../system/public/assistant/index.html", indexHtml);