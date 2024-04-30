try {
  let files = "{\"css\":[\"https://ip.hubfinanceiro.com/assistant/assets/index-BF1yMLSK.css\"],\"js\":[\"https://ip.hubfinanceiro.com/assistant/assets/index-BdlauSht.js\"]}";
  files = files? JSON.parse(files): null;
  if (!files) throw new Error("No template data found");

  const head = document.head;
  const body = document.body;

  if (files.css) {
    files.css.forEach((file) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = file;
      head.appendChild(link);
    });
  }

  if (files.js) {
    files.js.forEach((file) => {
      const script = document.createElement("script");
      script.src = file;
      body.appendChild(script);
    });
  }
} catch (e) {
  alert("Error parsing template data");
}