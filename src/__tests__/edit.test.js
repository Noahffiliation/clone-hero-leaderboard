/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Score, { getServerSideProps } from '../pages/scores/[id]/edit';
import { useRouter } from 'next/router';

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
    withRouter: (component) => component,
}));

// Mock global fetch
globalThis.fetch = jest.fn();

// Mock console.log to avoid clutter
globalThis.console.log = jest.fn();

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock HTMLFormElement.prototype.requestSubmit
beforeAll(() => {
    HTMLFormElement.prototype.requestSubmit = jest.fn();
});

describe('Score', () => {
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

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockImplementation(() => ({
            asPath: '/scores/123/edit',
            push: jest.fn(),
            query: { id: '123' },
        }));
    });

    it('renders the form with default values', () => {
        render(<Score allScores={mockAllScores} />);

        expect(screen.getByText('Edit Score')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Chart')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Artist')).toBeInTheDocument();
    });

    it('submits the form data', async () => {
        render(<Score allScores={mockAllScores} />);

        // Simulate user changing values (optional, but good for testing)
        const chartInput = screen.getByDisplayValue('Test Chart');
        fireEvent.change(chartInput, { target: { value: 'Updated Chart' } });

        // Click submit
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        // Verify fetch call
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/scores', expect.objectContaining({
            method: "PUT",
            body: expect.stringContaining('"chart":"Updated Chart"'),
        }));
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
