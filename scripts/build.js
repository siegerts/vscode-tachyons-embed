var fs = require("fs");
var path = require("path");
var css = require("css");

const tachyons = "node_modules/tachyons/css/tachyons.css";

const scope =
  "css, less, javascript, javascriptreact, html,  scss, stylus, typescript, typescriptreact, vue";

fs.readFile(tachyons, "utf8", function(err, contents) {
  if (err) throw err;

  let result = css.parse(contents);
  let rules = result.stylesheet.rules;
  let snippets = {};
  let media = new Set();
  let types = [".", "@"];

  rules.forEach(function(rule) {
    if (["rule", "media"].includes(rule.type)) {
      if (rule.type == "rule") {
        let firstChar = rule.selectors[0].slice(0, 1);

        if (types.includes(firstChar)) {
          let decs = rule.declarations.map(item => {
            return `\t${item.property}: ${item.value};`;
          });

          snippets[rule.selectors[0].slice(1)] = {
            prefix: rule.selectors[0],
            body: [`${rule.selectors} {`, ...decs, "}"],
            scope
          };
        }
      } else if (rule.type == "media") {
        //add to media
        media.add(`@${rule.media} {}`);
      }
    }
  });

  // add media to snippets
  snippets["media"] = {
    prefix: "@media",
    body: Array.from(media),
    scope
  };

  fs.writeFile(
    "./snippets/tachyons-embed.code-snippets",
    JSON.stringify(snippets, null, "\t"),
    "utf8",
    err => {
      if (err) throw err;
      console.log("🚀 Snippets created. \n");
    }
  );
});
