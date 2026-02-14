import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/scores';
import clientPromise from '../../../lib/mongodb';

// Mock mongodb
jest.mock('mongodb', () => {
    return {
        ObjectId: jest.fn((id) => id || 'mock-id'),
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

        // Setup mock return
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

    it('POST inserts data', async () => {
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

    it('POST returns 400 for invalid body', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: JSON.stringify({ 'constructor': 'evil' }), // Sanitize should remove this, leaving empty object
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('PUT updates data', async () => {
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
    });

    it('PUT returns 400 for invalid body', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            body: JSON.stringify({ _id: '123', 'constructor': 'evil' }),
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });
});
