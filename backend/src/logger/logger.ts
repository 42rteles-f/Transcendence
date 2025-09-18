import axios from 'axios';

class ELKLogger {
  private logstashUrl: string;
  private serviceName: string;
  private environment: string;

  constructor(
	logstashHost: string = process.env.LOGSTASH_HOST || 'transcendence-logstash',
	logstashPort: number = parseInt(process.env.LOGSTASH_PORT || '5005'),
	serviceName: string = process.env.SERVICE_NAME || 'backend',
	environment: string = process.env.NODE_ENV || 'development'
  ) {
	this.logstashUrl = `http://${logstashHost}:${logstashPort}`;
	this.serviceName = serviceName;
	this.environment = environment;
  }

  async log(message: string, level: string = 'info', metadata?: any): Promise<void> {
	const logEntry = {
	  '@timestamp': new Date().toISOString(),
	  message, level,
	  service: this.serviceName,
	  environment: this.environment,
	  ...metadata
	};

	try {
	  await axios.post(this.logstashUrl, logEntry, {
		headers: { 'Content-Type': 'application/json' }, timeout: 5000
	  });
	} 
	catch (error) {
	  console.error('Failed to send log to Logstash:', error);
	  //('Original log:', logEntry);
	}
  }

  async info(message: string, metadata?: any): Promise<void> {
	return this.log(message, 'info', metadata);
  }

  async warn(message: string, metadata?: any): Promise<void> {
	return this.log(message, 'warning', metadata);
  }

  async error(message: string, metadata?: any): Promise<void> {
	return this.log(message, 'error', metadata);
  }

  async debug(message: string, metadata?: any): Promise<void> {
	return this.log(message, 'debug', metadata);
  }
}

const pongGameLogger = new ELKLogger('transcendence-logstash', 5005, 'online-game-logger', 'production');
const tournamentGameLogger = new ELKLogger('transcendence-logstash', 5005, 'tournament-game-logger', 'production');
const localGameLogger = new ELKLogger('transcendence-logstash', 5005, 'local-logger', 'production');

const logger = new ELKLogger();

export {logger, pongGameLogger, tournamentGameLogger, localGameLogger};
//export { ELKLogger };