import cloudinary from 'cloudinary';
import fs from 'fs';

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

		fs.writeFile('image_texts/' + result.public_id + '.txt', extractedText, (err) => {
			if (err)
				throw err;
			console.log('File saved!');
		});

		return response.status(200).json({ data: extractedText });
	});
}
