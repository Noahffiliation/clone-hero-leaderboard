import React from 'react';
import MyDocument from '../pages/_document';

jest.mock('next/document', () => {
    const originalModule = jest.requireActual('next/document');
    return {
        __esModule: true,
        ...originalModule,
        default: class MockDocument {
            static async getInitialProps() {
                return {
                    html: '<html></html>',
                    head: [],
                    styles: []
                };
            }
        },
        Html: ({ children }) => <>{children}</>,
        Head: ({ children }) => <>{children}</>,
        Main: () => <div data-testid="main-content">Main</div>,
        NextScript: () => <div data-testid="next-script">NextScript</div>,
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

    it('renders document elements correctly', () => {
        const doc = new MyDocument();
        const tree = doc.render();

        expect(tree).toBeDefined();
        expect(tree.type).toBeDefined();
        expect(tree.props.lang).toBe('en');
    });
});
