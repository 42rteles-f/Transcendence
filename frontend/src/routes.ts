import { PageManager } from "./PageManager";
import { HomePage } from "../public/pages/home.ts";
import { LoginPage } from "../public/pages/login.ts";
import { PongGame } from "../public/pages/pong.ts";
import { RegisterPage } from "../public/pages/register.ts";
import { ProfilePage } from "../public/pages/profile.ts";
import { NotFoundPage } from "../public/pages/404.ts";
import { ticTacToePage } from "../public/pages/ticTacToe.ts";
import { TournamentsPage } from "../public/pages/tournaments.ts";

const routes: PageManager = new PageManager();

routes.register("/home", HomePage);
routes.register("/login", LoginPage);
routes.register("/pong", PongGame);
routes.register("/register", RegisterPage);
routes.register("/profile", ProfilePage);
routes.register("/404", NotFoundPage);
routes.register("/tic-tac-toe", ticTacToePage);
routes.register("/tournaments", TournamentsPage);

export { routes };
