import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/scores';
import clientPromise from '../../../lib/mongodb';

// Mock mongodb
jest.mock('mongodb', () => {
    return {
        ObjectId: jest.fn((id) => {
            if (id === 'invalid-id') throw new Error('Invalid ObjectId');
            return id || 'mock-id';
        }),
    };
});

// Mock lib/mongodb
jest.mock('../../../lib/mongodb', () => {
    const mCollection = {
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
    };
    const mDb = {
        collection: jest.fn(() => mCollection),
    };
    const mClient = {
        db: jest.fn(() => mDb),
        connect: jest.fn(),
    };
    return Promise.resolve(mClient);
});

describe('/api/scores', () => {
    it('GET returns generic data', async () => {
        const { req, res } = createMocks({
            method: 'GET',
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.toArray.mockResolvedValueOnce([{ chart: 'Test Chart' }]);

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            status: 200,
            data: [{ chart: 'Test Chart' }],
        });
    });

    it('POST inserts data when body is JSON string', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: JSON.stringify({ chart: 'New Chart' }),
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.insertOne.mockResolvedValueOnce({ insertedId: '123' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({ insertedId: '123' });
        expect(collection.insertOne).toHaveBeenCalledWith(expect.objectContaining({ chart: 'New Chart' }));
    });

    it('POST inserts data when body is already an object', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { chart: 'New Chart Object' },
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.insertOne.mockResolvedValueOnce({ insertedId: '456' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({ insertedId: '456' });
    });

    it('POST returns 400 for empty or invalid body', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'invalid-json-content',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'No valid fields provided' });
    });

    it('POST returns 400 when body is null literal', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'null',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'No valid fields provided' });
    });

    it('POST returns 400 when all keys are forbidden or dotted', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: JSON.stringify({ constructor: 'evil', $gt: '', 'nested.dot': 'val' }),
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('PUT updates data successfully', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            body: JSON.stringify({ _id: '123', chart: 'Updated Chart' }),
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
    });

    it('PUT returns 400 if _id missing', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            body: JSON.stringify({ chart: 'Updated Chart' }),
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Missing _id' });
    });

    it('PUT returns 400 if _id has invalid format', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            body: JSON.stringify({ _id: 'invalid-id', chart: 'Updated Chart' }),
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid _id format' });
    });

    it('PUT returns 400 for invalid body with no valid update fields', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            body: JSON.stringify({ _id: '123', constructor: 'evil' }),
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'No valid fields to update' });
    });

    it('returns 405 Method Not Allowed for unsupported methods', async () => {
        const { req, res } = createMocks({
            method: 'DELETE',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toEqual(['GET', 'POST', 'PUT']);
    });
});
