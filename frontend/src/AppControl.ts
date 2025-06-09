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

	static createSocket(): boolean {
		this.socket = io("http://localhost:3000");

		this.socket.on('connect', () => {
			console.log('Connected to server!', this.socket!.id);
			// localStorage.setItem('socketId', this.socket.id);
		});
		  
		this.socket.on('disconnect', () => {
			console.log('Disconnected from server');
		});
		return (!!this.socket);
	}

	static async login(username: string, password: string) {
		const res = await fetch("http://localhost:3000/login", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				},
			body: JSON.stringify({ username, password })
		})
		.then(res => {
			if (res.ok) this.createSocket();
			return res.json();
		});
		alert(`Login request sent, ${res.message!}`);
		return (res.ok);
	}

	static addChatListener(observer: (...args: any[]) => void): void {
		if (!this.socket && !this.createSocket()) {
			console.error('Socket not initialized. Call createSocket() first.');
			return ;
		}
		this.chatObservers.push(observer);
		this.socket!.on("chat-message", observer);
	}

	static removeChatListener(observer: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error('Socket not initialized. Call createSocket() first.');
			return ;
		}
		const index = this.chatObservers.indexOf(observer);
		if (index !== -1) {
			this.chatObservers.splice(index, 1);
			this.socket!.off('chat-message', observer);
		}
	}

	static sendChatMessage(event: string, message: string): void {
		if (!this.socket) {
			console.error('Socket not initialized. Call createSocket() first.');
			return ;
		}
		this.socket!.emit(event, message);
		console.log('Chat message sent:', message);
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