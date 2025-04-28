import { PageManager } from "./PageManager";

export const views: PageManager = new PageManager(window.location.pathname);

console.log("views start")