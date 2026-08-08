import { createMocks } from 'node-mocks-http';
import OCR from '@/pages/api/cloudinaryApi';
import cloudinary from 'cloudinary';
import clientPromise from '../../../lib/mongodb';

// Mock cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload: jest.fn(),
        },
    },
    config: jest.fn(),
}));

// Mock lib/mongodb
jest.mock('../../../lib/mongodb', () => {
    const mCollection = {
        insertOne: jest.fn(),
    };
    const mDb = {
        collection: jest.fn(() => mCollection),
    };
    const mClient = {
        db: jest.fn(() => mDb),
    };
    return Promise.resolve(mClient);
});

describe('/api/cloudinaryApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uploads image and saves scoresheet directly to MongoDB', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'data:image/png;base64,...',
        });

        const mockResult = {
            info: {
                ocr: {
                    adv_ocr: {
                        data: [
                            {
                                textAnnotations: [
                                    { description: 'Chart Name\nArtist Name\nCharter Name\n\n\n100000\n\n\n\n100%\n\n1000\n1000\n0\n1000\n4x\n0' },
                                    { description: 'Chart' },
                                ],
                            },
                        ],
                    },
                },
            },
        };

        cloudinary.v2.uploader.upload.mockImplementation((image, options, callback) => {
            callback(null, mockResult);
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.insertOne.mockResolvedValueOnce({ insertedId: 'score-123' });

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(collection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
            chart: 'Chart Name',
            artist: 'Artist Name',
        }));
        expect(JSON.parse(res._getData())).toEqual({ data: 'Chart' });
    });

    it('handles non-POST methods with 405', async () => {
        const { req, res } = createMocks({
            method: 'GET',
        });

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toEqual(['POST']);
    });

    it('handles cloudinary upload errors', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'bad_data',
        });

        cloudinary.v2.uploader.upload.mockImplementation((image, options, callback) => {
            callback(new Error('Upload failed'), null);
        });

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(500);
    });

    it('handles missing or empty textAnnotations', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'image_no_text',
        });

        cloudinary.v2.uploader.upload.mockImplementation((image, options, callback) => {
            callback(null, { info: { ocr: { adv_ocr: { data: [{ textAnnotations: [] }] } } } });
        });

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('handles database insertion errors', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: 'valid_image',
        });

        cloudinary.v2.uploader.upload.mockImplementation((image, options, callback) => {
            callback(null, {
                info: {
                    ocr: {
                        adv_ocr: {
                            data: [{ textAnnotations: [{ description: 'Only Chart' }] }],
                        },
                    },
                },
            });
        });

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection();
        collection.insertOne.mockRejectedValueOnce(new Error('DB failure'));

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(500);
    });
});
