import { io, Socket } from 'socket.io-client';
import { Pointer } from './PageManager';
import { jwtDecode } from "jwt-decode";
import Api from './api/Api';

export class AppControl {
	private	static socket:			Pointer<Socket> = null;
	private static chatObservers:	Function[] = [];
	public static api: Api = new Api();

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
		const apiUrl = import.meta.env.API_URL || "http://localhost:3000";

		this.socket = io(apiUrl, {
			transports: ['websocket'],
			auth: {
				token: localStorage.getItem("authToken") || ""
			}
		});

		this.socket.on('connect', () => {
			console.log('Connected to server!', this.socket!.id);
			const token = this.getValidDecodedToken() as { id: string | number } | null;
			if (token?.id) {
				this.socket!.emit("join", { userId: token.id });
			}
		});
		
		this.socket.on('connect_error', (err) => {
			console.error('Socket connection error:', err.message);
		});

		this.socket.on('disconnect', () => {
			console.log('Disconnected from server');
		});

		this.socket.on("friendship-updated", () => {
			const modal = document.querySelector("friend-list-modal") as any;
			if (modal && typeof modal.fetchUsersAndRequests === "function") {
				modal.fetchUsersAndRequests().then(() => modal.renderList());
			}
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
		const userApiUrl = /* (import.meta.env.VITE_USER_API_URL + "login") || */ "http://localhost:3000/user/login";
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				},
			body: JSON.stringify({ username, password })
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Login failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Login failed: ${res.status} ${data.message}`);
		this.createSocket();
		localStorage.setItem("authToken", data.message);
		return (res.ok);
	}

	static async register(username: string, nickname: string, password: string) {
		// console.log(`coming from AppControl.register: ${username} ${password}`);
		// console.log(`${JSON.stringify({username, password})}`);
		const userApiUrl = /* (import.meta.env.VITE_USER_API_URL + "register") ||  */"http://localhost:3000/user/register";
		let data = {} as { message: any };
		console.log(`username, nickname, password: ${username}, ${nickname}, ${password}`);
		const res = await fetch(userApiUrl, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				},
			body: JSON.stringify({ username, nickname, password })
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Register failed: ${error}`);
		}
		// console.log("Register response:", data);
		if (!res.ok)
			throw new Error(`Register failed: ${res.status} ${data.message}`);
		this.createSocket();
		localStorage.setItem("authToken", data.message);
		return (res.ok);
	}

	static async getProfile(id: string | number | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `profile/${id}`) || `http://localhost:3000/user/profile/${id}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get profile failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Get profile failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async getMatchHistory(id: string | number, page: number = 1, pageSize: number = 10): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `match-history/${id}`) || `http://localhost:3000/user/match-history/${id}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl + `?page=${page}&pageSize=${pageSize}`, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get match history failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Get match history failed: ${res.status} ${data.message}`);
		return (data.message);
	}
	
	static async updateProfile(form: FormData): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + "update") || "http://localhost:3000/user/update";
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "POST",
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: form
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Update profile failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Update profile failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async friendRequest(friendId: number, status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship'): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `friend-request/${friendId}`) || `http://localhost:3000/user/friend-request/${friendId}`;
		console.log(`URL called: ${userApiUrl}`);
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ status })
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Friend request failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Friend request failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async getFriendRequest(friendId: number | string | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `friend-request/${friendId}`) || `http://localhost:3000/user/friend-request/${friendId}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get friend request failed: ${error}`);
		}
		if (!res.ok && res.status !== 404)
			throw new Error(`Get friend request failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async getAllFriendRequests(friendId: number | string | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `all-friend-requests/${friendId}`) || `http://localhost:3000/user/all-friend-requests/${friendId}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get friend request failed: ${error}`);
		}
		if (!res.ok && res.status !== 404)
			throw new Error(`Get friend request failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async findUsers(userId: number | string | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `not-friends-list/${userId}`) || `http://localhost:3000/user/not-friends-list/${userId}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get not friends failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Get not friends failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async getAllFriends(userId: number | string | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `friends-list/${userId}`) || `http://localhost:3000/user/friends-list/${userId}`;
		let data = {} as { message: any };
		const res = await fetch(userApiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get friends failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Get friends failed: ${res.status} ${data.message}`);
		return (data.message);
	}

	static async logout(): Promise<void> {
		const token = localStorage.getItem("authToken");
		if (!token) {
			console.error('No token found. Cannot logout.');
			return;
		}
		localStorage.removeItem("authToken");
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		console.log('Logged out successfully');
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

	static onlineClientsListener(observer: (...args: any[]) => void): void {
		if (!this.socket &&  !this.createSocket()) {
			console.error('Socket not initialized. Call createSocket() first.');
			return ;
		}
		this.socket!.emit('online-clients');
		this.socket!.on('online-clients', observer);
	}

	static sendChatMessage(event: string, targetId: string, message: string): void {
		if (!this.socket) {
			console.error('Socket not initialized. Call createSocket() first.');
			return ;
		}
		this.socket!.emit(event, { target: targetId, message: message });
		console.log('Chat message sent:', message);
	}

	public static getSocket(): Pointer<Socket> {
		return this.socket;
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

/*
cs50 CS
harvard fundamentals
harvard leadership
java course
harvard python
sdlc
*/