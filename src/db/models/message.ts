import { DataTypes } from 'sequelize';
import sequelize from '../db';

export enum Role {
	SYSTEM = 'system',
	USER = 'user',
	ASSISTANT = 'assistant',
}

const Message = sequelize.define('message', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	chat: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'chats',
			key: 'id',
		},
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	role: {
		type: DataTypes.ENUM(Role.SYSTEM, Role.USER, Role.ASSISTANT),
		defaultValue: Role.USER,
	},
	timestamp: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

export default Message;
