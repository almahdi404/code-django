const fs = require("fs");
const path = require("path");

fs.readFile("package.json", "utf-8", function (err, data) {
  if (err) throw err;
  if (isJsonString(data)) {
    const jsn = JSON.parse(data);
    const snippetConfigs = jsn["contributes"]["snippets"];

    for (let snippetConfig of snippetConfigs) {
      const snippetPath = snippetConfig["path"];

      fs.readFile(snippetPath, "utf-8", function (err, data) {
        if (err) throw err;
        if (isJsonString(data)) {
          const dataUnsorted = JSON.parse(data);
          const dataSorted = Object.keys(dataUnsorted)
            .sort()
            .reduce((obj, key) => {
              const snippet = dataUnsorted[key];
              obj[key] = {
                prefix: snippet["prefix"],
                body: snippet["body"],
                description: snippet["description"],
              };
              return obj;
            }, {});

          fs.writeFile(snippetPath, JSON.stringify(dataSorted), function (err) {
            if (err) throw err;
            console.log(`${path.normalize(snippetPath)} (sorted)`);
          });
        }
      });
    }
  }
});

function isJsonString(str) {
  if (typeof str != "string") return false;
  try {
    const json = JSON.parse(str);
    return typeof json == "object";
  } catch {
    return false;
  }
}
