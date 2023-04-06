import fs from 'fs';

function readFiles() {
	let scores = [];
	fs.readdirSync('image_texts').forEach((file) => {
		fs.readFile(`image_texts/${file}`, 'utf8', (err, data) => {
			if (err) {
				console.log(err);
			}

			let lines = data.split('\n');
			const scoresheet = {
				chart: lines[0],
				artist: lines[1],
				charter: lines[2],
				score: lines[5],
				percentage: lines[lines.length-14],
				total_notes: lines[lines.length-12],
				notes_hit: lines[lines.length-11],
				notes_missed: lines[lines.length-10],
				best_streak: lines[lines.length-9],
				avg_multiplier: lines[lines.length-8],
				overstrums: lines[lines.length-7]
			};
			
			scores.push(scoresheet);
			console.log(scores)
		});
	});
	return scores;
}

export default function parseUpload(req, res) {
	const scores = readFiles();
	return res.status(200).json({ data: scores });
}
