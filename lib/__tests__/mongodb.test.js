jest.mock('mongodb', () => {
    const mMongoClient = { connect: jest.fn().mockResolvedValue('connected') };
    return { MongoClient: jest.fn(() => mMongoClient) };
});

describe('lib/mongodb', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        delete global._mongoClientPromise;
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = OLD_ENV;
        delete global._mongoClientPromise;
    });

    it('should throw an error if MONGODB_URI is not defined', () => {
        delete process.env.MONGODB_URI;
        expect(() => {
            require('./../mongodb');
        }).toThrow('Add Mongo URI to .env.local');
    });

    it('should connect in production mode without global cache', () => {
        process.env.NODE_ENV = 'production';
        process.env.MONGODB_URI = 'mongodb://localhost:27017/prod-db';

        const mongoModule = require('./../mongodb');
        const { MongoClient } = require('mongodb');

        expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017/prod-db');
        expect(mongoModule.default).toBeDefined();
    });

    it('should use global cache in development mode', () => {
        process.env.NODE_ENV = 'development';
        process.env.MONGODB_URI = 'mongodb://localhost:27017/dev-db';

        const mongoModule1 = require('./../mongodb');
        expect(global._mongoClientPromise).toBeDefined();

        jest.resetModules();
        const mongoModule2 = require('./../mongodb');
        expect(mongoModule2.default).toBe(mongoModule1.default);
    });
});
