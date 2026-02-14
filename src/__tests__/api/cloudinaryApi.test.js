import { createMocks } from 'node-mocks-http';
import OCR from '@/pages/api/cloudinaryApi';
import cloudinary from 'cloudinary';

// Mock cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload: jest.fn(),
        },
    },
    config: jest.fn(), // If needed
}));

// Mock global fetch
globalThis.fetch = jest.fn();

describe('/api/cloudinaryApi', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('uploads image and parses OCR text', async () => {
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
                                    // other annotations...
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

        await OCR(req, res);

        expect(res._getStatusCode()).toBe(200);
        // The handler triggers a fetch to save score
        expect(fetch).toHaveBeenCalled();

        // And returns extracted text
        // The implementation parses description into extractedText
        // Check if response contains expected text structure or data
    });

    it('handles upload errors', async () => {
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
});
