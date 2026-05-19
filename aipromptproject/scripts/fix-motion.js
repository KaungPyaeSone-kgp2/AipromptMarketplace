import fs from "fs";
import path from "path";

const root = path.resolve("frontend/src");

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".jsx")) fixFile(full);
  }
}

function fixFile(file) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes("motion")) return;
  c = c.replaceAll("<motion", "<div").replaceAll("</motion>", "</div>");
  fs.writeFileSync(file, c);
  console.log("fixed", file);
}

walk(root);
