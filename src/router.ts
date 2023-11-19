import express from 'express';
import { createNewChat, getChatByEmail, getMessagesByChatId } from './controller/chat_controller';
const router = (app: express.Express) => {
	const baseApiRouter = express.Router();
	const chatRouter = express.Router();

	baseApiRouter.get('/', async (req, res) => {
		res.send('Hello World!');
	});

	chatRouter.post('/', createNewChat);
	chatRouter.get('/:email', getChatByEmail);
	chatRouter.get('/:chatId/messages', getMessagesByChatId);

	baseApiRouter.use('/chat', chatRouter);
	app.use('/api', baseApiRouter);
};
export default router;
