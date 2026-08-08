export async function getScoresServerSideProps() {
	const res = await fetch(process.env.BASE_URL + '/api/scores', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const allScores = await res.json();

	return {
		props: { allScores },
	};
}
