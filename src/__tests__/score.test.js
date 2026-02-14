/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Score from '@/pages/scores/[id]';
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
    useRouter: () => ({
        asPath: '/scores/1',
    }),
}));

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
    it('renders score details correctly', () => {
        render(<Score allScores={mockScores} />);

        expect(screen.getByText('Test Chart')).toBeInTheDocument();
        expect(screen.getByText('Artist: Test Artist')).toBeInTheDocument();
        expect(screen.getByText('Score: 100000')).toBeInTheDocument();
    });

    // Add more assertions for other fields if needed
});
