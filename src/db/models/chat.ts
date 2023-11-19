import { DataTypes } from 'sequelize';
import sequelize from '../db';
import Message from './message';

const Chat = sequelize.define('chat', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'New Chat',
	},
	threadId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

Chat.hasMany(Message, {
	foreignKey: 'chat',
	onDelete: 'CASCADE',
});

export default Chat;
