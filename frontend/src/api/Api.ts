import { jwtDecode } from "jwt-decode";
import { Pointer } from "../PageManager";
import { routes } from "../routes";

class Api {
    private static apiUrl: string = "http://192.168.1.8:3000/"; // ou use import.meta.env.VITE_API_URL
    private static userApiUrl: string = "http://192.168.1.8:3000/user/"; // ou use import.meta.env.VITE_USER_API_URL
    private static token: Pointer<string> = null;

    static errorCheck(response: Response) {
        if (response.status === 401) {
            localStorage.removeItem("authToken");
            routes.navigate("/login");
        } else if (response.status === 403) {
            const error = new Error('Forbidden');
            (error as any).status = response.status;
            throw error;
        } else if (response.status === 404) {
            const error = new Error('Not Found');
            (error as any).status = response.status;
            throw error;
        } else if (!response.ok) {
            const error = new Error('Server Error');
            (error as any).status = response.status;
            throw error;
        }
    }

    static async makeRequest(apiPath: string, method: "GET" | "POST", body?: string, params?: URLSearchParams | "") {
        let fullPath = `${this.apiUrl}${apiPath}`;
        if (params && typeof params === "object" && params.toString())
            fullPath += '?' + params.toString();

        const response = await fetch(fullPath, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
            },
            body: body
        });
        this.errorCheck(response);
        return (response.json());
    }

    static async login(username: string, password: string) {
        const body = JSON.stringify({ username, password });
        const response = await this.makeRequest("user/login", "POST", body);
        this.token = response.message;
        console.log(jwtDecode(this.token!));
        localStorage.setItem("authToken", this.token!);
        return (response);
    }

    static async register(username: string, nickname: string, password: string) {
        const body = JSON.stringify({ username, nickname, password });
        const response = await this.makeRequest("user/register", "POST", body);
        this.token = response.message;
        localStorage.setItem("authToken", this.token!);
        return response;
    }

    static async getProfile(id: string | number | null): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}profile/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async getMatchHistory(id: string | number, page: number = 1, pageSize: number = 10): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}match-history/${id}?page=${page}&pageSize=${pageSize}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async updateProfile(form: FormData): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}update`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async friendRequest(friendId: number, status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship'): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}friend-request/${friendId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async getFriendRequest(friendId: number | string | null): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}friend-request/${friendId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async getAllFriendRequests(friendId: number | string | null): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}all-friend-requests/${friendId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async findUsers(userId: number | string | null): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}not-friends-list/${userId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async getAllFriends(userId: number | string | null): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}friends-list/${userId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
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
        const response = await fetch(`${this.apiUrl}tournament/all?page=${page}&pageSize=${pageSize}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async createTournament(name: string, maxPlayers: number, displayName: string): Promise<{ tournamentId: number }> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/create`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, maxPlayers, displayName })
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async getTournament(tournamentId: number): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/${tournamentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async cancelTournament(tournamentId: number): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/cancel/${tournamentId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async joinTournament(tournamentId: number, displayName: string): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/join/${tournamentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ displayName })
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async unsubscribeTournament(tournamentId: number): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/unsubscribe/${tournamentId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async startTournament(tournamentId: number): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.apiUrl}tournament/start/${tournamentId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async logout(): Promise<void> {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error('No token found. Cannot logout.');
            return;
        }
        localStorage.removeItem("authToken");
        console.log('Logged out successfully');
    }
}

export default Api;


	// static async postRequest(apiPath: string, body: string) {
	// 	const response = await fetch(`${this.apiUrl}/${apiPath}`, {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
	// 		},
	// 		body: body,
	// 	});
	// 	this.errorCheck(response);
	// 	return (response.json());
	// }

	// static async getRequest(apiPath: string, params: URLSearchParams | "") {
	// 	const response = await fetch(`${this.apiUrl}/${apiPath}?${params.toString()}`, {
	// 		method: "GET",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
	// 		},
	// 	});
	// 	this.errorCheck(response);
	// 	return (response.json());
	// }