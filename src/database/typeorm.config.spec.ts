import { buildTypeOrmModuleOptions } from './typeorm.config';

describe('buildTypeOrmModuleOptions', () => {
  const configService = (values: Record<string, string | undefined>) => ({
    get: jest.fn((key: string) => values[key]),
  });

  it('should disable synchronize when DATABASE_URL is present in development', () => {
    const options = buildTypeOrmModuleOptions(
      configService({
        DATABASE_URL: 'postgres://user:password@example.neon.tech/neondb',
        NODE_ENV: 'development',
      }),
    );

    expect(options).toMatchObject({
      type: 'postgres',
      url: 'postgres://user:password@example.neon.tech/neondb',
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
      synchronize: false,
    });
  });

  it('should disable synchronize when DATABASE_URL is present in production', () => {
    const options = buildTypeOrmModuleOptions(
      configService({
        DATABASE_URL: 'postgres://user:password@example.neon.tech/neondb',
        NODE_ENV: 'production',
      }),
    );

    expect(options.synchronize).toBe(false);
  });

  it('should enable synchronize for local development without DATABASE_URL', () => {
    const options = buildTypeOrmModuleOptions(
      configService({
        NODE_ENV: 'development',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: '',
        DB_NAME: 'inkquiry',
      }),
    );

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'inkquiry',
      autoLoadEntities: true,
      synchronize: true,
    });
  });

  it('should disable synchronize for local production without DATABASE_URL', () => {
    const options = buildTypeOrmModuleOptions(
      configService({
        NODE_ENV: 'production',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: '',
        DB_NAME: 'inkquiry',
      }),
    );

    expect(options.synchronize).toBe(false);
  });
});
