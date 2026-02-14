import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../pages/_app';

// Mock the NextUIProvider and NextThemesProvider
jest.mock('@nextui-org/react', () => ({
    NextUIProvider: ({ children }) => <div data-testid="next-ui-provider">{children}</div>,
}));

jest.mock('next-themes', () => ({
    ThemeProvider: ({ children, ...props }) => (
        <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
            {children}
        </div>
    ),
}));

describe('App', () => {
    it('renders the component with providers', () => {
        const Component = () => <div>Test Component</div>;
        const pageProps = { title: 'Test Page' };

        render(<App Component={Component} pageProps={pageProps} />);

        // Check if the component is rendered
        expect(screen.getByText('Test Component')).toBeInTheDocument();

        // Check if providers are present
        expect(screen.getByTestId('next-ui-provider')).toBeInTheDocument();

        const themeProvider = screen.getByTestId('next-themes-provider');
        expect(themeProvider).toBeInTheDocument();

        // Check props passed to ThemeProvider
        const props = JSON.parse(themeProvider.getAttribute('data-props'));
        expect(props.attribute).toBe('class');
        expect(props.defaultTheme).toBe('dark');
    });
});
