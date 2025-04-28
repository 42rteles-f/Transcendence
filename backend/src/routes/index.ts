import { server } from '..';

interface IRouter  {
	url: string,
	method: "get" | "post" | "delete" | "update" | "patch",
	action: Function;
	auth: boolean;
};

const routes = new Map<string, IRouter[]>();

export function Router(prefix?: string) {
	return function (constructor: Function) {
		if (!prefix) prefix = constructor.name.toLowerCase().replace("routes", "");
		const register = async (fastify: any, options: any) => {
			for (const data of routes.get(constructor.name) || []) {
				console.log(`/${prefix}/${data.url}`)
				fastify[data.method](`/${data.url}`,{
					onRequest: data.auth ? [fastify.authenticate] : undefined,
					handler: data.action
				  });
			}
		}
		server.register(register, { prefix: `/${prefix}` })
	}
}


export function Get(url?: string, auth: boolean = true) {
	return function (
	  target: any,
	  propertyKey: string,
	  descriptor: PropertyDescriptor
	) {
		const targetName = target.constructor.name;
		if (!url) url = propertyKey.toLowerCase();
		if (routes.has(targetName))
		{	
			routes.get(targetName)?.push({
				url,
				method: "get",
				action: descriptor.value,
				auth
			});
		}
		else
		{	routes.set(targetName, [{
				url,
				method: "get",
				action: descriptor.value,
				auth
			}])
		}
	  return descriptor
	}
}
  
export function Post(url?: string, auth: boolean = true) {
	return function (
	  target: any,
	  propertyKey: string,
	  descriptor: PropertyDescriptor
	) {
		const targetName = target.constructor.name;
		if (!url) url = propertyKey.toLowerCase();

		if (routes.has(targetName)) {	
			routes.get(targetName)?.push({
				url,
				method: "post",
				action: descriptor.value,
				auth
			});
		} else {
			routes.set(targetName, [{
				url,
				method: "get",
				action: descriptor.value,
				auth
			}])
		}
	  return descriptor
	}
}
  