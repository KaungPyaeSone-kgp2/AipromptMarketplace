function highlight(text, vars) {
  let escapedText = text;
  vars.forEach(v => {
    let name = v.name.trim();
    // Escape regex characters
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the name, optionally surrounded by brackets
    const regex = new RegExp(`\\[?${safeName}\\]?`, "gi");
    
    escapedText = escapedText.replace(regex, (match) => {
      return `<span style="color: ${v.color}">${match}</span>`;
    });
  });
  return escapedText;
}

const text1 = "Create a [Topic] list";
const vars1 = [{name: "Topic", color: "red"}];
console.log(1, highlight(text1, vars1));

const text2 = "Create a Topic list";
const vars2 = [{name: "Topic", color: "red"}];
console.log(2, highlight(text2, vars2));

const text3 = "Create a [Topic] list";
const vars3 = [{name: "[Topic]", color: "red"}];
console.log(3, highlight(text3, vars3));
