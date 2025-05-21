import UserDatabase from '../database/user';
import IResponse from '../interfaces/user';

export default class UserService {
	private db: UserDatabase;

	constructor () {
		this.db = new UserDatabase();
	}
	
	async register(username: string, password: string): Promise<IResponse> {
		return (await this.db.register(username, password));
	}

	async login(username: string, password: string): Promise<IResponse> {
		return (await this.db.login(username, password));
	}
}

