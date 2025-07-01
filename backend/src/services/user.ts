import { Database } from 'sqlite3';
import UserDatabase from '../database/user';
import IResponse from '../interfaces/user';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default class UserService {
	private db: UserDatabase;

	constructor (db: Database) {
		this.db = new UserDatabase(db);
	}

	async register(username: string, nickname: string, password: string): Promise<IResponse> {
		return (await this.db.register(username, nickname, password));
	}

	async login(username: string, password: string): Promise<IResponse> {
		return (await this.db.login(username, password));
	}

	async updateProfile(
		userId: number,
		username: string | undefined,
		nickname: string | undefined,
		fileName: string | undefined
	): Promise<IResponse> {	
		return (await this.db.updateProfile(userId, username, nickname, fileName));
	}

	async profile(id: number): Promise<IResponse> {
		return (await this.db.profile(id));
	}

	async all(): Promise<IResponse> {
		return (await this.db.all());
	}

	async matchHistory(
		userId: number,
		page: number = 1,
		pageSize: number = 10
	): Promise<IResponse> {
		return (await this.db.matchHistory(userId, page, pageSize));
	}

	async friendRequest(
		userId: number,
		friendId: number,
		stautus: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship'
	) {
		return (await this.db.friendRequest(userId, friendId, stautus));
	}

	async getFriendRequest(
		userId: number,
		friendId: number
	): Promise<IResponse> {
		return (await this.db.getFriendRequest(userId, friendId));
	}

	async getAllNotFriends(
		userId: number
	): Promise<IResponse> {
		return (await this.db.getAllNotFriends(userId));
	}

	async getAllFriends(
		userId: number
	): Promise<IResponse> {
		return (await this.db.getAllFriends(userId));
	}
}

