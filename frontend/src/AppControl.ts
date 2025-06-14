import { io, Socket } from 'socket.io-client';
import { Pointer } from './PageManager';
import { jwtDecode } from "jwt-decode";

export class AppControl {
	private	static socket:			Pointer<Socket> = null;
	private static chatObservers:	Function[] = [];

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
		this.socket = io("http://localhost:3001");

		this.socket.on('connect', () => {
			console.log('Connected to server!', this.socket!.id);
			// localStorage.setItem('socketId', this.socket.id);
		});
		  
		this.socket.on('disconnect', () => {
			console.log('Disconnected from server');
		});
		return (!!this.socket);
	}

	static getValidDecodedToken() {
		const token = localStorage.getItem("authToken");
		if (!token) return (null);

		try {
			const decoded = jwtDecode(token);
			const now = Math.floor(Date.now() / 1000);
			if (decoded.exp! < now) {
				localStorage.removeItem("authToken");
				return (null);
			}
			return (decoded);
		} catch {
			localStorage.removeItem("authToken");
			return (null);
		}
	}

	static async login(username: string, password: string) {
		const res = await fetch("http://localhost:3001/user/login", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				},
			body: JSON.stringify({ username, password })
		});
		const data = await res.json();
		if (!res.ok)
			throw new Error(`Login failed: ${res.status} ${data.message}`);
		this.createSocket();
		localStorage.setItem("authToken", data.message);
		return (res.ok);
	}

	static async register(username: string, nickname: string, password: string) {
		// console.log(`coming from AppControl.register: ${username} ${password}`);
		// console.log(`${JSON.stringify({username, password})}`);
		const res = await fetch("http://localhost:3001/user/register", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				},
			body: JSON.stringify({ username, nickname, password })
		});
		const data = await res.json();
		// console.log("Register response:", data);
		if (!res.ok)
			throw new Error(`Register failed: ${res.status} ${data.message}`);
		this.createSocket();
		localStorage.setItem("authToken", data.message);
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