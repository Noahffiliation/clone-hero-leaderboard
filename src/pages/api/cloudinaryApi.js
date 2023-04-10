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
			.map((anno, i) => i > 0 && anno.description.replace(/[^0-9a-z]/gi, ''))
			.filter((entry) => typeof entry === 'string')
			.join(' ');

		let lines = textAnnotations[0].description.split('\n');

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

		fetch("http://localhost:3000//api/scores", {
			method: "POST",
			body: JSON.stringify(scoresheet),
		});

		return response.status(200).json({ data: extractedText });
	});
}
