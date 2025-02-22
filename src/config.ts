export class Configuration {
  public nodeVersion = process.versions.node;
  public env: string = process.env.NODE_ENV || 'development';
  public port: number = parseInt(process.env.PORT ?? '3000', 10);
  public baseUrl: string = process.env.BASE_URL || 'localhost';
  public logLevel: string = process.env.LOG_LEVEL || 'info';
  public database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    mongoProtocol: string;
  } = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT?? '27017', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    name: process.env.DATABASE_NAME || 'test',
    mongoProtocol: process.env.DB_PROTOCOL || 'mongodb',
  };
}
