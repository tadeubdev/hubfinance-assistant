import fs from "fs";


const envProduction = fs.readFileSync("./.env.production", "utf8");
let viteApiUrl = envProduction.split("\n").find((line) => line.startsWith("VITE_API_URL"));
viteApiUrl = viteApiUrl? viteApiUrl.split("=")[1]: "";
if (!viteApiUrl) {
  throw new Error("VITE_API_URL not found in .env.production");
}
const URL_BASE = viteApiUrl.replace(/"/g, "").trim() + "/chat/assets";

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
