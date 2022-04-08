const fs = require("fs");
const path = require("path");

fs.readFile("package.json", "utf-8", function (err, data) {
  if (err) throw err;
  if (isJsonString(data)) {
    const jsn = JSON.parse(data);
    const snippetConfigs = jsn["contributes"]["snippets"];

    let snippetStore = {};
    for (let snippetConfig of snippetConfigs) {
      const snippetPath = snippetConfig["path"];
      const snippetLang = snippetConfig["language"];
      if (Array.isArray(snippetStore[snippetPath])) {
        snippetStore[snippetPath].push(snippetLang);
      } else {
        snippetStore[snippetPath] = [snippetLang];
      }
    }

    const snippetStoreSorted = Object.keys(snippetStore)
      .sort()
      .reduce((obj, key) => {
        obj[key] = snippetStore[key];
        return obj;
      }, {});

    let snippetTables = "";
    for (let i in snippetStoreSorted) {
      const snippetPath = path.parse(i);
      const folder = path.normalize(snippetPath.dir).split(path.sep)[1];
      snippetTables += `\n### _**${folder}**_ / _**${snippetPath.name}**_`;
      snippetTables += "\n| Trigger | Description |";
      snippetTables += "\n|---------|-------------|";

      const data = fs.readFileSync(i, "utf-8");
      if (isJsonString(data)) {
        const snippets = JSON.parse(data);
        for (let i in snippets) {
          const prefix = escape(snippets[i]["prefix"], ["underscores"]);
          const description = escape(snippets[i]["description"]);
          snippetTables += `\n| \`${prefix}\` | ${description} |`;
        }
        snippetTables += "\n";
      }
    }

    fs.readFile("README.md", "utf-8", function (err, data) {
      if (err) throw err;
      const readme = data.replace(
        /<!-- StartSnippets -->.*<!-- EndSnippets -->/s,
        `<!-- StartSnippets -->${snippetTables}<!-- EndSnippets -->`
      );
      fs.writeFile("README.md", readme, function (err) {
        if (err) throw err;
      });
    });
  }
});

function isJsonString(str) {
  if (typeof str != "string") return false;
  try {
    const json = JSON.parse(str);
    return typeof json == "object";
  } catch (e) {
    return false;
  }
}

const replacements = [
  [/\\/g, "\\\\", "backwardslashes"],
  [/\//g, "\\/", "forwardslashes"],
  [/`/g, "\\`", "backtick"],
  [/\*/g, "\\*", "asterisks"],
  [/_/g, "\\_", "underscores"],
  [/\(/g, "\\(", "parentheses"],
  [/\)/g, "\\)", "parentheses"],
  [/\{/g, "\\{", "curlybraces"],
  [/\}/g, "\\}", "curlybraces"],
  [/\[/g, "\\[", "squareBrackets"],
  [/\]/g, "\\]", "squareBrackets"],
  [/\+/g, "\\+", "plus"],
  [/-/g, "\\-", "hyphen"],
  [/#/g, "\\#", "pounds"],
  [/\|/g, "\\|", "bars"],
  [/</g, "&lt;", "angleBrackets"],
  [/>/g, "&gt;", "angleBrackets"],
];

function escape(string, skips) {
  skips = skips || [];
  return replacements.reduce(function (string, replacement) {
    const name = replacement[2];
    return name && skips.indexOf(name) !== -1
      ? string
      : string.replace(replacement[0], replacement[1]);
  }, string);
}
