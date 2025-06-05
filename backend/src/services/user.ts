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
		username: string,
		nickname: string,
		password: string
	): Promise<IResponse> {	
		return (await this.db.updateProfile(username, nickname, password));
	}

	async profile(id: number): Promise<IResponse> {
		return (await this.db.profile(id));
	}

	async all(): Promise<IResponse> {
		return (await this.db.all());
	}
}

