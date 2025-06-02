// import { routes } from "./routes"
// import { Page } from "./old_model/Page"
import { io, Socket } from 'socket.io-client';
import { Pointer } from './PageManager';

export class AppControl {
	private	static socket: Pointer<Socket> = null;
	private static chatObservers: Function[] = [];
	constructor() {}

    static getCookie(name :string) {
        let cookieValue :string = "";
    
        if (document.cookie && document.cookie !== '')
        {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++)
            {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return (cookieValue);
    }

	static createSocket(): void {
		this.socket = io("http://localhost:3000");

		this.socket.on('connect', () => {
			console.log('Connected to server!', this.socket!.id);
		});
		  
		this.socket.on('disconnect', () => {
		console.log('Disconnected from server');
		});
		  
	}

	static addChatListener(chat: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error('Socket not initialized. Call createSocket() first.');
		}
		this.chatObservers.push(chat);
		this.socket!.on('chat', chat);
	}

	static removeChatListener(chat: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error('Socket not initialized. Call createSocket() first.');
		}
		const index = this.chatObservers.indexOf(chat);
		if (index !== -1) {
			this.chatObservers.splice(index, 1);
			this.socket!.off('chat', chat);
			console.log('Chat observer removed:', chat);
		}
	}

    // static async fetchElement(name :string): Promise<Boolean> {
	// 	if (routes.get(name))
	// 		return (true);
    //     try {
	// 		name = "/" + name.replace(/^\/+/, "");
	// 		await import(`/pages${name}.ts`);

	// 		const page :Page = routes.get(name)!;
	// 		await Promise.all(
	// 			page.getDependencies().map(dep => this.fetchElement(dep))
	// 		);
	// 		return (true);
    //     }

	// 	catch (error) {
	// 		console.error('Error:', error);
    //         return (false);
    //     }
    // }
}
