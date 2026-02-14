/* eslint-disable react/prop-types */
import MyDocument from '../pages/_document';

jest.mock('next/document', () => {
    const originalModule = jest.requireActual('next/document');
    return {
        __esModule: true,
        ...originalModule,
        default: class MockDocument {
            static async getInitialProps(ctx) {
                return {
                    html: '<html></html>',
                    head: [],
                    styles: []
                };
            }
        },
        Html: ({ children }) => <html lang="en">{children}</html>,
        Head: ({ children }) => <head>{children}</head>,
        Main: () => <main>Main</main>,
        NextScript: () => <script>NextScript</script>,
    };
});

describe('MyDocument', () => {
    it('getInitialProps should return initial props with styles', async () => {
        const ctx = { renderPage: jest.fn() };
        const initialProps = await MyDocument.getInitialProps(ctx);

        expect(initialProps).toHaveProperty('html');
        expect(initialProps).toHaveProperty('head');
        expect(initialProps).toHaveProperty('styles');
        expect(Array.isArray(initialProps.styles)).toBe(true);
    });
});
