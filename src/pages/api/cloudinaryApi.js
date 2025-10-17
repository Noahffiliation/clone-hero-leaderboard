import cloudinary from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

export default function OCR(request, response) {
	const image = request.body;

	return cloudinary.v2.uploader.upload(image, { ocr: 'adv_ocr' }, (error, result) => {
		if (error)
			return response.status(500).json({ error });

		const { textAnnotations } = result.info.ocr.adv_ocr.data[0];

		const extractedText = textAnnotations
			.map((anno, i) => i > 0 && anno.description.replaceAll(/[^0-9a-z]/gi, ''))
			.filter((entry) => typeof entry === 'string')
			.join(' ');

		let lines = textAnnotations[0].description.split('\n');

		const scoresheet = {
			chart: lines[0],
			artist: lines[1],
			charter: lines[2],
			score: lines[5],
			percentage: lines.at(-14),
			total_notes: lines.at(-12),
			notes_hit: lines.at(-11),
			notes_missed: lines.at(-10),
			best_streak: lines.at(-9),
			avg_multiplier: lines.at(-8),
			overstrums: lines.at(-7)
		};

		fetch("http://localhost:3000//api/scores", {
			method: "POST",
			body: JSON.stringify(scoresheet),
		});

		return response.status(200).json({ data: extractedText });
	});
}
