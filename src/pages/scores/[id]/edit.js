import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

function UpdateScore() {
	const updatedScore = {
		_id: document.getElementById("_id").value,
		chart: document.getElementById("chart").value,
		artist: document.getElementById("artist").value,
		charter: document.getElementById("charter").value,
		score: document.getElementById("score").value,
		percentage: document.getElementById("percentage").value,
		total_notes: document.getElementById("total_notes").value,
		notes_hit: document.getElementById("notes_hit").value,
		notes_missed: document.getElementById("notes_missed").value,
		best_streak: document.getElementById("best_streak").value,
		avg_multiplier: document.getElementById("avg_multiplier").value,
		overstrums: document.getElementById("overstrums").value
	};

	console.log(updatedScore);

	fetch("http://localhost:3000/api/scores", {
		method: "PUT",
		body: JSON.stringify(updatedScore),
	});
}

export default function Score({ allScores }) {
	const router = useRouter();
	const score_id = router.asPath.split('/')[2];
	return (
		<>
			<Head>
				<title>Clone Hero Leaderboard - {allScores.data.find((score) => score._id === score_id).chart}</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<form>
				<h1>Edit Score</h1>

				<p hidden id='_id'>{allScores.data.find((score) => score._id === score_id)._id}</p>

				<label>Name </label>
				<input type="text" id="chart" defaultValue={allScores.data.find((score) => score._id === score_id).chart} />
				<br></br>

				<label>Artist </label>
				<input type="text" id="artist" defaultValue={allScores.data.find((score) => score._id === score_id).artist} />
				<br></br>

				<label>Charter </label>
				<input type="text" id="charter" defaultValue={allScores.data.find((score) => score._id === score_id).charter} />
				<br></br>

				<label>Score </label>
				<input type="text" id="score" defaultValue={allScores.data.find((score) => score._id === score_id).score} />
				<br></br>

				<label>Percentage </label>
				<input type="text" id="percentage" defaultValue={allScores.data.find((score) => score._id === score_id).percentage} />
				<br></br>

				<label>Total Notes </label>
				<input type="text" id="total_notes" defaultValue={allScores.data.find((score) => score._id === score_id).total_notes} />
				<br></br>

				<label>Notes Hit </label>
				<input type="text" id="notes_hit" defaultValue={allScores.data.find((score) => score._id === score_id).notes_hit} />
				<br></br>

				<label>Notes Missed </label>
				<input type="text" id="notes_missed" defaultValue={allScores.data.find((score) => score._id === score_id).notes_missed} />
				<br></br>

				<label>Best Streak </label>
				<input type="text" id="best_streak" defaultValue={allScores.data.find((score) => score._id === score_id).best_streak} />
				<br></br>

				<label>Average Multiplier </label>
				<input type="text" id="avg_multiplier" defaultValue={allScores.data.find((score) => score._id === score_id).avg_multiplier} />
				<br></br>

				<label>Overstrums </label>
				<input type="text" id="overstrums" defaultValue={allScores.data.find((score) => score._id === score_id).overstrums} />
				<br></br>

				<button type="submit" onClick={UpdateScore}>Submit</button>
				<Link href={`/scores/${allScores.data.find((score) => score._id === score_id)._id}`}>Back</Link>
			</form>
		</>
	)
}

export async function getServerSideProps() {
	let res = await fetch(process.env.BASE_URL + '/api/scores', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	});
	let allScores = await res.json();

	return {
		props: { allScores },
	};
}