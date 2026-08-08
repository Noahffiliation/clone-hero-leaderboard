import { getScoresServerSideProps } from './getScoresProps';

describe('getScoresServerSideProps', () => {
	beforeEach(() => {
		globalThis.fetch = jest.fn();
		process.env.BASE_URL = 'http://localhost:3000';
	});

	it('fetches scores and returns props', async () => {
		const mockScores = { data: [{ _id: '1', chart: 'Test Chart' }] };
		globalThis.fetch.mockResolvedValueOnce({
			json: jest.fn().mockResolvedValueOnce(mockScores),
		});

		const result = await getScoresServerSideProps();

		expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/scores', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		expect(result).toEqual({
			props: { allScores: mockScores },
		});
	});
});
