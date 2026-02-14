/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/pages/index';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/font/google', () => ({
    Inter: () => ({ style: { fontFamily: 'mocked-font' } }),
}));

jest.mock('next/head', () => {
    return {
        __esModule: true,
        default: ({ children }) => {
            return <>{children}</>;
        },
    };
});

jest.mock('next/link', () => {
    return ({ children }) => {
        return <a href="/mock">{children}</a>;
    };
});

jest.mock('next/image', () => {
    return (props) => {
        return <img alt={props.alt} {...props} />;
    };
});

// Mock fetch
globalThis.fetch = jest.fn();

const mockScores = {
    data: [
        {
            _id: '1',
            chart: 'Test Chart',
            artist: 'Test Artist',
            charter: 'Test Charter',
            score: 100000,
            percentage: '100%',
            total_notes: 1000,
            notes_hit: 1000,
            notes_missed: 0,
            best_streak: 1000,
            avg_multiplier: 4,
            overstrums: 0,
        },
    ],
};

describe('Home Page', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('renders the leaderboard correctly', () => {
        render(<Home allScores={mockScores} />);

        expect(screen.getByText('Clone Hero Leaderboard')).toBeInTheDocument();
        expect(screen.getByText('Test Chart')).toBeInTheDocument();
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('handles image upload interaction', async () => {
        render(<Home allScores={mockScores} />);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        // Mock FileReader
        const fileReaderMock = {
            readAsDataURL: jest.fn(),
            onload: null,
            result: 'data:image/png;base64,mockedbase64',
        };

        globalThis.FileReader = jest.fn(() => fileReaderMock);

        // Trigger file selection (This might be tricky as the input interacts with HandleOnChange)
        // The input has no label or clear way to select, checking by type="file" might help if I could specific select it
        // The input has name="file".
        // Let's use getByRole or querySelector
        // The file input is inside a div, it has name="file"
        const input = document.querySelector('input[name="file"]');

        // Simulate user selecting a file
        // Note: The component uses onChange on the form, bubbling up from the input?
        // The form has onChange={handleOnChange}
        // So changing the input should trigger the form onChange

        // We need to trigger the change event on the input.
        // However, since handleOnChange relies on FileReader, we need to mock the event properly.

        // Let's simulate the FileReader behavior manually if needed or rely on the mock.
        // When readAsDataURL is called, we should trigger onload.

        fileReaderMock.readAsDataURL.mockImplementation((blob) => {
            fileReaderMock.result = 'data:image/png;base64,mocked';
            if (fileReaderMock.onload) {
                fileReaderMock.onload({ target: { result: fileReaderMock.result } });
            }
        });

        fireEvent.change(input, { target: { files: [file] } });

        // Expect image to appear
        await waitFor(() => {
            expect(screen.getByAltText('uploaded image')).toBeInTheDocument();
        });
    });

    it('handles form submission', async () => {
        render(<Home allScores={mockScores} />);

        // Mock fetch response
        fetch.mockResolvedValueOnce({
            json: async () => ({ data: 'Extracted Text Result' }),
        });

        // We need to set the image first to enable the button logic if any (button is always there but text changes)
        // Actually the button text changes based on loading state.

        const submitButton = screen.getByRole('button', { name: /Detect/i });

        fireEvent.submit(submitButton.closest('form'));

        // Loading state check might be fast, but let's check if fetch was called
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/cloudinaryApi', expect.objectContaining({
                method: 'POST',
            }));
        });
    });

});
