import { PageManager } from "./PageManager";
import { HomePage } from "../public/pages/home.ts";
import { LoginPage } from "../public/pages/login.ts";
import { PongGame } from "../public/pages/pong.ts";

const routes: PageManager = new PageManager();

routes.register("/home", HomePage);
routes.register("/login", LoginPage);
routes.register("/pong", PongGame);

export { routes };