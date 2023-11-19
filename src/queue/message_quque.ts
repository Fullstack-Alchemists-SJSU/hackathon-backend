import { Queue, Worker } from 'bullmq';
import redis from './redis';
import Message from '../db/models/message';
import { io } from '../index';
import { callAssistant } from '../controller/chat_controller';

export type TaskType<S, T> = {
	type: 'sync' | 'async';
	message: string;
	chatId: number;
	threadId: string;
};

export const QUEUE_NAME = 'assistant-message-queue';

const messagesQueue = new Queue(QUEUE_NAME, {
	connection: redis,
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: true,
	},
});

const messageWorker = new Worker(
	QUEUE_NAME,
	async (job) => {
		console.log('returning reply from assistant');
		const { message, chatId, threadId } = job.data;
		const result = await callAssistant(message, chatId, threadId);
		if (result) {
			const [assistantMessage, error] = result;
			if (error) {
				console.log(error);
			} else if (assistantMessage) {
				redis.set(message, assistantMessage.content);
				console.log('set', message, assistantMessage.content);
				io.emit('assistantReply', assistantMessage);
			}
		} else {
			console.log('Something went wrong');
		}
	},
	{ connection: redis }
);

messagesQueue.on('waiting', (job) => {
	console.log('added new job for message ', job.data.message);
});

messagesQueue.on('paused', () => {
	console.log('queue paused');
});

messagesQueue.on('resumed', () => {
	console.log('queue resumed');
});

messagesQueue.on('progress', (job) => {
	console.log('job progress', job.id, job.getState());
});

export default messagesQueue;
