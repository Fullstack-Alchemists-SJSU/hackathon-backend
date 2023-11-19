import express from 'express';
import router from './router';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db/db';
import http from 'http';
import { Server } from 'socket.io';
import { callAssistant } from './controller/chat_controller';
import openAi from './openai/openai';
import messagesQueue, { QUEUE_NAME, TaskType } from './queue/message_quque';
import redis from './queue/redis';
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cors({
		origin: ['http://localhost:3002', 'http://localhost:3000'],
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
	})
);
router(app);

const server = http.createServer(app);
export const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3002',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	},
});


io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('newMessage', async (data: { message: string; chatId: number; threadId: string }) => {

		redis.get(data.message, async (err, reply) => {
			if (reply) {
				console.log("returning reply from redis")
				io.emit('assistantReply', reply);
			} else {
				const task: TaskType<{ message: string; chatId: number; threadId: string }, any> = {
					message: data.message,
					chatId: data.chatId,
					threadId: data.threadId,
					type: 'async',
				};
				const job = await messagesQueue.add(QUEUE_NAME, task);
			}
		});
	});
});

db.authenticate()
	.then(() => {
		db.sync()
			.then(() => {
				app.listen(3000, () => {
					console.log('Server is listening on port 3000');
					server.listen(3001, () => {
						console.log('socket listening on 3001');
					});
				});
			})
			.catch((err: any) => {
				console.error('db error', err);
			});
	})
	.catch((err: any) => {
		console.error('DB Auth error', err);
	});
