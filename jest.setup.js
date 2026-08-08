import '@testing-library/jest-dom'

process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.CLOUDINARY_NAME = 'test';
process.env.CLOUDINARY_KEY = 'test';
process.env.CLOUDINARY_SECRET = 'test';

if (typeof window !== 'undefined' && window.HTMLFormElement) {
    window.HTMLFormElement.prototype.requestSubmit = function () {
        this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    };
}
if (typeof HTMLFormElement !== 'undefined') {
    HTMLFormElement.prototype.requestSubmit = function () {
        this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    };
}
