import createApp from "./app.js";

async function start() {
	const app = await createApp();

	app.listen(3000, function() {
	console.log('Auth service running in 3000');
	})
}

start();

