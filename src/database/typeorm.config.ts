import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type ConfigReader = {
  get(key: string): string | undefined;
};

export function buildTypeOrmModuleOptions(
  configService: ConfigReader,
): TypeOrmModuleOptions {
  const databaseUrl = configService.get('DATABASE_URL');
  const nodeEnv = configService.get('NODE_ENV') ?? 'development';
  const isProduction = nodeEnv === 'production';

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
      synchronize: false,
    };
  }

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: Number(configService.get('DB_PORT')),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: !isProduction,
  };
}
