import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home, { getServerSideProps } from '@/pages/index';
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
    return ({ children, href }) => {
        return <a href={href || "/mock"}>{children}</a>;
    };
});

jest.mock('next/image', () => {
    return (props) => {
        return <img alt={props.alt} {...props} />;
    };
});

// Mock fetch and console.log
globalThis.fetch = jest.fn();
globalThis.console.log = jest.fn();

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
        jest.clearAllMocks();
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

        const fileReaderMock = {
            readAsDataURL: jest.fn(),
            onload: null,
            result: 'data:image/png;base64,mockedbase64',
        };

        globalThis.FileReader = jest.fn(() => fileReaderMock);

        fileReaderMock.readAsDataURL.mockImplementation(() => {
            fileReaderMock.result = 'data:image/png;base64,mocked';
            if (fileReaderMock.onload) {
                fileReaderMock.onload({ target: { result: fileReaderMock.result } });
            }
        });

        const input = document.querySelector('input[name="file"]');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByAltText('uploaded image')).toBeInTheDocument();
        });
    });

    it('handles successful form submission', async () => {
        render(<Home allScores={mockScores} />);

        fetch.mockResolvedValueOnce({
            json: async () => ({ data: 'Extracted Text Result' }),
        });

        const submitButton = screen.getByRole('button', { name: /Detect/i });
        fireEvent.submit(submitButton.closest('form'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/cloudinaryApi', expect.objectContaining({
                method: 'POST',
            }));
        });
    });

    it('handles json parse failure in handleOnSubmit catch chain', async () => {
        render(<Home allScores={mockScores} />);

        fetch.mockResolvedValueOnce({
            json: async () => {
                throw new Error('Invalid JSON');
            },
        });

        const submitButton = screen.getByRole('button', { name: /Detect/i });
        fireEvent.submit(submitButton.closest('form'));

        await waitFor(() => {
            expect(globalThis.console.log).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    it('handles fetch network failure in handleOnSubmit try/catch', async () => {
        render(<Home allScores={mockScores} />);

        fetch.mockImplementationOnce(() => {
            throw new Error('Network error');
        });

        const submitButton = screen.getByRole('button', { name: /Detect/i });
        fireEvent.submit(submitButton.closest('form'));

        await waitFor(() => {
            expect(globalThis.console.log).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    it('fetches server side props correctly', async () => {
        process.env.BASE_URL = 'http://localhost:3000';
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockScores),
        });

        const result = await getServerSideProps();

        expect(result).toEqual({
            props: { allScores: mockScores },
        });
    });
});
