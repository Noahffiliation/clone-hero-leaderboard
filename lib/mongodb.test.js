jest.mock('mongodb', () => {
    const mMongoClient = { connect: jest.fn().mockResolvedValue('connected') };
    return { MongoClient: jest.fn(() => mMongoClient) };
});

describe('lib/mongodb', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should throw an error if MONGODB_URI is not defined', () => {
        delete process.env.MONGODB_URI;
        expect(() => {
            require('./mongodb');
        }).toThrow('Add Mongo URI to .env.local');
    });

    it('should create a MongoClient with options and connect', () => {
        // Use the value from jest.setup.js or override it
        process.env.MONGODB_URI = 'mongodb://localhost:27017/test-custom';

        const mongoModule = require('./mongodb');
        const { MongoClient } = require('mongodb');

        expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017/test-custom', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        // Verify export
        expect(mongoModule.default).toBeDefined();
    });
});
