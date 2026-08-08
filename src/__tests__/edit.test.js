import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Score, { getServerSideProps } from '../pages/scores/[id]/edit';
import { useRouter } from 'next/router';

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
    withRouter: (component) => component,
}));

// Mock global fetch
globalThis.fetch = jest.fn();

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('Score Edit Page', () => {
    const mockAllScores = {
        data: [
            {
                _id: '123',
                chart: 'Test Chart',
                artist: 'Test Artist',
                charter: 'Test Charter',
                score: '1000',
                percentage: '100',
                total_notes: '100',
                notes_hit: '100',
                notes_missed: '0',
                best_streak: '100',
                avg_multiplier: '4',
                overstrums: '0'
            }
        ]
    };

    let pushMock;

    beforeEach(() => {
        jest.clearAllMocks();
        pushMock = jest.fn();
        useRouter.mockImplementation(() => ({
            asPath: '/scores/123/edit',
            push: pushMock,
            query: { id: '123' },
        }));
    });

    it('renders the form with default values', () => {
        render(<Score allScores={mockAllScores} />);

        expect(screen.getByText('Edit Score')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Chart')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Artist')).toBeInTheDocument();
    });

    it('renders the form with empty defaults when score has missing fields', () => {
        render(<Score allScores={{ data: [{ _id: '123' }] }} />);
        expect(screen.getByText('Edit Score')).toBeInTheDocument();
    });

    it('renders the form with default values when router query is empty', () => {
        useRouter.mockImplementation(() => ({
            asPath: '/scores/123/edit',
            push: pushMock,
            query: {},
        }));
        render(<Score allScores={mockAllScores} />);
        expect(screen.getByDisplayValue('Test Chart')).toBeInTheDocument();
    });

    it('renders fallback title when score is not found', () => {
        useRouter.mockImplementation(() => ({}));
        render(<Score allScores={{ data: [] }} />);
        expect(screen.getByText('Edit Score')).toBeInTheDocument();
    });

    it('submits the form data and redirects', async () => {
        render(<Score allScores={mockAllScores} />);

        const chartInput = screen.getByDisplayValue('Test Chart');
        fireEvent.change(chartInput, { target: { name: 'chart', value: 'Updated Chart' } });

        const submitButton = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: expect.stringContaining('"chart":"Updated Chart"'),
            }));
            expect(pushMock).toHaveBeenCalledWith('/scores/123');
        });
    });

    it('submits the form data and redirects using score_id fallback when score not found', async () => {
        useRouter.mockImplementation(() => ({
            asPath: '/scores/456/edit',
            push: pushMock,
            query: { id: '456' },
        }));

        render(<Score allScores={{ data: [] }} />);

        const submitButton = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
                method: 'PUT',
                body: expect.stringContaining('"_id":"456"'),
            }));
            expect(pushMock).toHaveBeenCalledWith('/scores/456');
        });
    });
});

describe('getServerSideProps', () => {
    it('fetches scores and returns props', async () => {
        process.env.BASE_URL = 'http://localhost:3000';
        const mockData = { data: [{ _id: '1' }] };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockData),
        });

        const response = await getServerSideProps();

        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/scores', expect.anything());
        expect(response).toEqual({
            props: { allScores: mockData },
        });
    });
});
