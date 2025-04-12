import { views } from "./main";

type EventInfo = {
	id: string;
	type: string;
	handler: EventListener;
};

type PageList = {
	pageName: string;
	displayFunction: Function;
	events: EventInfo[];
	dependencies? :string[];
};

views.setElementObj({
	pageName: "home",
	displayFunction: () => {
		views.urlLoad("register") ;
	},
	events: [
		{id: "login_b", type: "click", handler: () => {views.urlLoad("home")}},
		{id: "register_b", type: "click", handler: () => {views.urlLoad("home")}}
	],
	dependencies: ["navbar"],
});


views.setElement("login", () => {
	views.load("navbar");
})
.addEvents(
	{id: "login_b", type: "click", handler: () => {views.urlLoad("home")}},
	{id: "register_b", type: "click", handler: () => {views.urlLoad("home")}}
)
.setDependencies(
	"navbar", "home"
);
