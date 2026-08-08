import React from 'react';
import { render, screen } from '@testing-library/react';
import Score, { getServerSideProps } from '@/pages/scores/[id]';
import { useRouter } from 'next/router';
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

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock global fetch
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
        {
            _id: '2',
            chart: 'Another Chart',
            artist: 'Another Artist',
            charter: 'Test Charter',
            score: 50000,
            percentage: '90%',
            total_notes: 500,
            notes_hit: 450,
            notes_missed: 50,
            best_streak: 100,
            avg_multiplier: 3,
            overstrums: 5,
        },
    ],
};

describe('Score Detail Page', () => {
    beforeEach(() => {
        useRouter.mockReturnValue({
            asPath: '/scores/1',
            query: { id: '1' },
        });
    });

    it('renders score details correctly with query id', () => {
        render(<Score allScores={mockScores} />);

        expect(screen.getByText('Test Chart')).toBeInTheDocument();
        expect(screen.getByText('Artist: Test Artist')).toBeInTheDocument();
        expect(screen.getByText('Score: 100000')).toBeInTheDocument();
        expect(screen.getByText('Charter: Test Charter')).toBeInTheDocument();
        expect(screen.getByText('Percentage: 100%')).toBeInTheDocument();
        expect(screen.getByText('Total Notes: 1000')).toBeInTheDocument();
        expect(screen.getByText('Notes Hit: 1000')).toBeInTheDocument();
        expect(screen.getByText('Notes Missed: 0')).toBeInTheDocument();
        expect(screen.getByText('Best Streak: 1000')).toBeInTheDocument();
        expect(screen.getByText('Average Multiplier: 4')).toBeInTheDocument();
        expect(screen.getByText('Overstrums: 0')).toBeInTheDocument();
    });

    it('renders score details correctly when router.query is empty', () => {
        useRouter.mockReturnValue({
            asPath: '/scores/1',
            query: {},
        });
        render(<Score allScores={mockScores} />);
        expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('renders fallback when score is not found', () => {
        useRouter.mockReturnValue({});
        render(<Score allScores={{ data: [] }} />);

        expect(screen.getByText('Score Not Found')).toBeInTheDocument();
        expect(screen.getByText('Back')).toBeInTheDocument();
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
