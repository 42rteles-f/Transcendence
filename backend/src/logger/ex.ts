import logger from './logger';  // { ELKLogger }

// async + await | Blocking
// no async + await | Non blocking
// .then() => ?


async function example1() {
	await logger.log('Application started');
	await logger.info('User logged in');
	await logger.warn('API rate limit approaching');
	await logger.error('Database connection failed');
	await logger.debug('Processing user request');
	
	await logger.info('User action', {
		userId: 123,
		action: 'purchase',
		amount: 99.99,
		items: ['item1', 'item2']
	});
}

async function example2() {
	try {
		throw new Error('Something went wrong');
	} catch (error: any) {
		await logger.error('Application error', {
			error: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString()
		});
	}
}

/* async function example3() {
	const customLogger = new ELKLogger('localhost', 5000, 'auth-service', 'production');
	await customLogger.log('Custom service message (auth-service)');
}*/

example1();
example2();
//example3();
