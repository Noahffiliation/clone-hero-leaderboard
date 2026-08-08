import cloudinary from 'cloudinary';
import clientPromise from '../../../lib/mongodb';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function OCR(request, response) {
	if (request.method !== 'POST') {
		response.setHeader('Allow', ['POST']);
		return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
	}

	const image = request.body;

	return new Promise((resolve) => {
		cloudinary.v2.uploader.upload(image, { ocr: 'adv_ocr' }, async (error, result) => {
			if (error) {
				response.status(500).json({ error });
				return resolve();
			}

			try {
				const textAnnotations = result?.info?.ocr?.adv_ocr?.data?.[0]?.textAnnotations;

				if (!textAnnotations || textAnnotations.length === 0) {
					response.status(400).json({ error: 'No text detected in image' });
					return resolve();
				}

				const extractedText = textAnnotations
					.map((anno, i) => i > 0 && anno.description.replaceAll(/[^0-9a-z]/gi, ''))
					.filter((entry) => typeof entry === 'string')
					.join(' ');

				const lines = textAnnotations[0].description.split('\n');

				const scoresheet = {
					chart: lines[0],
					artist: lines[1] ?? '',
					charter: lines[2] ?? '',
					score: lines[5] ?? '',
					percentage: lines.at(-14) ?? '',
					total_notes: lines.at(-12) ?? '',
					notes_hit: lines.at(-11) ?? '',
					notes_missed: lines.at(-10) ?? '',
					best_streak: lines.at(-9) ?? '',
					avg_multiplier: lines.at(-8) ?? '',
					overstrums: lines.at(-7) ?? '',
				};

				const client = await clientPromise;
				const db = client.db('clone-hero-scores');
				await db.collection('scores').insertOne(scoresheet);

				response.status(200).json({ data: extractedText });
				return resolve();
			} catch (dbError) {
				response.status(500).json({ error: dbError.message });
				return resolve();
			}
		});
	});
}
