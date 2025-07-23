import { io, Socket as SocketIo } from 'socket.io-client';
import { Pointer } from './PageManager';
import { jwtDecode } from "jwt-decode";
import Socket from "./Socket";

export class AppControl {
	private	static socket:			Pointer<SocketIo> = null;

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
			throw new Error(`Login failed:  ${data.message}`);
		Socket.init();
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
			throw new Error(`Register failed:  ${data.message}`);
		this.createSocket();
		localStorage.setItem("authToken", data.message);
		return (res.ok);
	}

	static async getProfile(id: string | number | null): Promise<any> {
		const token = localStorage.getItem("authToken");
		const userApiUrl = (import.meta.env.VITE_USER_API_URL + `profile/${id}`) || `http://localhost:3000/user/profile/${id}`;
		console.log(`URL called: ${userApiUrl}`);
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
			throw new Error(`Get profile failed:  ${data.message}`);
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
			throw new Error(`Get match history failed:  ${data.message}`);
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
			throw new Error(`Update profile failed:  ${data.message}`);
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
			throw new Error(`Friend request failed:  ${data.message}`);
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
			throw new Error(`Get friend request failed:  ${data.message}`);
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
			throw new Error(`Get friend request failed:  ${data.message}`);
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
			throw new Error(`Get not friends failed:  ${data.message}`);
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
			throw new Error(`Get friends failed:  ${data.message}`);
		return (data.message);
	}

	static async getAllTournaments(page: number = 1, pageSize: number = 5): Promise<{
		tournaments: {
		id: number,
		name: string,
		startDate: string,
		winnerId: number,
			ownerId: number,
			ownerName: string,
			maxPlayers: number,
			status: string,
			winnerName: string | null
		}[],
		total: number
	}> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/all?page=${page}&pageSize=${pageSize}`) || `http://localhost:3000/tournament/all?page=${page}&pageSize=${pageSize}`;
		let data = {} as {
			message: {
				tournaments: {
					id: number,
					name: string,
					startDate: string,
					winnerId: number,
					ownerId: number,
					ownerName: string,
					maxPlayers: number,
					status: string,
					winnerName: string | null
				}[],
				total: number
			}
		};
		const res = await fetch(apiUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Get tournaments failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Get tournaments failed:  ${data.message}`);
		return data.message;
	}

	static async createTournament(name: string, maxPlayers: number, displayName: string): Promise<{ tournamentId: number }> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/create`) || "http://localhost:3000/tournament/create";
		let data = {} as { message: { tournamentId: number } };
		const res = await fetch(apiUrl, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ name, maxPlayers, displayName })
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Create tournament failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Create tournament failed:  ${data.message}`);
		return data.message;
	}

	static async getTournament(tournamentId: number): Promise<any> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/${tournamentId}`) || `http://localhost:3000/tournament/${tournamentId}`;
		let data = {} as { message: any };
		const res = await fetch(apiUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
			console.log(`Getting tournament data: ${JSON.stringify(data)}`);
		} catch (error) {
			throw new Error(`Getting tournament failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Getting Tournament failed:  ${data.message}`);
		return data.message;
	}

	static async cancelTournament(tournamentId: number): Promise<any> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/cancel/${tournamentId}`) || `http://localhost:3000/tournament/cancel/${tournamentId}`;
		let data = {} as { message: any };
		const res = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Canceling tournament failed: ${error}`);
		}
		if (!res.ok){
			throw new Error(`Canceling Tournament failed: ${data.message}`);
		}
		return data.message;
	}

	static async joinTournament(tournamentId: number, displayName: string): Promise<any> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/join/${tournamentId}`) || `http://localhost:3000/tournament/join/${tournamentId}`;
		let data = {} as { message: any };
		const res = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({ displayName })
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Joining tournament failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Joining Tournament failed:  ${data.message}`);
		return data.message;
	}

	static async unsubscribeTournament(tournamentId: number): Promise<any> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/unsubscribe/${tournamentId}`) || `http://localhost:3000/tournament/unsubscribe/${tournamentId}`;
		let data = {} as { message: any };
		const res = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Unsubscribing from tournament failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Unsubscribing from Tournament failed:  ${data.message}`);
		return data.message;
	}

	static async startTournament(tournamentId: number): Promise<any> {
		const token = localStorage.getItem("authToken");
		const apiUrl = (import.meta.env.VITE_API_URL + `tournament/start/${tournamentId}`) || `http://localhost:3000/tournament/start/${tournamentId}`;
		let data = {} as { message: any };
		const res = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});
		try {
			data = await res.json();
		} catch (error) {
			throw new Error(`Starting tournament failed: ${error}`);
		}
		if (!res.ok)
			throw new Error(`Starting Tournament failed:  ${data.message}`);
		return data.message;
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

// Error loading profile
// Get profile failed: SyntaxError: Unexpected token '<', "

/*
cs50 CS
harvard fundamentals
harvard leadership
java course
harvard python
sdlc
*/