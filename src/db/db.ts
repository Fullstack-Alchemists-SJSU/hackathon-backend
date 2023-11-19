import { Sequelize } from 'sequelize';
require('dotenv').config();
const sequelize = new Sequelize(
	process.env.DATABASE_NAME as string,
	process.env.DATABASE_USER as string,
	process.env.DATABASE_PASSWORD as string,
	{
		host: process.env.DATABASE_HOST,
		dialect: 'mysql',
		dialectOptions: {
			connectTimeout: 60000,
		},
		logging: true,
		port: process.env.DATABASE_PORT as unknown as number,
	}
);
export default sequelize;
