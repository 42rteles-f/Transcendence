import { views } from "../../src/views"

console.log("executing home.ts");

const newdiv :HTMLDivElement = document.createElement('div');
newdiv.innerHTML = await fetch("/pages/home.html").then(response => response.text());

views.setElement("/home", () => {})
.setHtml(newdiv)
.setDependencies("/navbar");


// console.log([...views.views().keys()]);

/* @vite-ignore */  