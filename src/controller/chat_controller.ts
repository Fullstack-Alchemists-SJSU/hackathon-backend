import { Request, Response } from 'express';
import openAi from '../openai/openai';
import Chat from '../db/models/chat';
import Message from '../db/models/message';
require('dotenv').config();

export const createNewChat = async (req: Request, res: Response) => {
	const email = req.body.email;

	if (!email) {
		res.status(400).json({ message: 'Insufficient data' });
		return;
	}
	try {
		const thread = await openAi.beta.threads.create();

		const newChat = await Chat.create({
			title: 'New Chat',
			timestamp: new Date().toString(),
			email,
			threadId: thread.id,
		});

		res.status(201).json(newChat);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getChatByEmail = async (req: Request, res: Response) => {
	const { email } = req.params;

	if (!email) {
		res.status(400).json({ message: 'Insufficient data' });
		return;
	}

	try {
		const chat = await Chat.findAll({
			where: {
				email,
			},
			include: [{ model: Message }],
			order: [[Message, 'timestamp', 'ASC']],
		});

		if (!chat) {
			res.status(404).json({ message: 'Chat not found' });
			return;
		}

		res.status(200).json(chat);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getMessagesByChatId = async (req: Request, res: Response) => {
	const { chatId } = req.params;

	if (!chatId) {
		res.status(400).json({ message: 'Insufficient data' });
		return;
	}

	try {
		const messages = await Message.findAll({
			where: {
				chat: chatId,
			},
		});

		res.status(200).json(messages);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export async function callAssistant(
	message: string,
	chatId: number,
	threadId: string
): Promise<[assistantMessage: any, error: any] | undefined> {
	console.log('in call', message, chatId, threadId);
	try {
		const newThreadMessage = await openAi.beta.threads.messages.create(threadId, {
			role: 'user',
			content: message,
		});

		const newMessageSqlRecord = await Message.create({
			chat: chatId,
			content: message,
			role: 'user',
			timestamp: newThreadMessage.created_at,
		});

		let run = await openAi.beta.threads.runs.create(threadId, {
			assistant_id: process.env.OPENAI_ASSISTANT_ID as string,
		});

		while (run.status !== 'completed' && run.status !== 'failed') {
			run = await openAi.beta.threads.runs.retrieve(threadId, run.id);
			await sleep(1000);
		}
		const runForLastMessage = await openAi.beta.threads.runs.retrieve(threadId, run.id);
		const messages = await openAi.beta.threads.messages.list(threadId);
		const filteredAssistantMessages = messages.data
			.filter((message) => message.role === 'assistant')
			.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));

		const lastMessage = filteredAssistantMessages[filteredAssistantMessages.length - 1];

		if (runForLastMessage.status === 'completed') {
			const assistantMessageRecord = await Message.create({
				chat: chatId,
				content: (lastMessage.content as any)[0].text.value,
				role: 'assistant',
				timestamp: lastMessage.created_at,
			});

			return [assistantMessageRecord, null];
		} else if (runForLastMessage.status === 'failed') {
			console.log(runForLastMessage);
			return [null, runForLastMessage];
		}
	} catch (err) {
		console.log(err);
		return [null, err];
	}
}
