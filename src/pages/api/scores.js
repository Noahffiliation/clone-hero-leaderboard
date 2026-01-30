import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
	const client = await clientPromise;
	const db = client.db('clone-hero-scores');
	switch (req.method) {
		case 'POST': {
			let bodyObject = JSON.parse(req.body);
			let myScore = await db.collection('scores').insertOne(bodyObject);
			res.json(myScore);
			break;
		}
		case 'GET': {
			const allScores = await db.collection('scores').find().toArray();
			res.json({ status: 200, data: allScores });
			break;
		}
		case 'PUT': {
			let bodyObject = JSON.parse(req.body);
			const { _id, ...updateFields } = bodyObject;

			if (!_id) {
				res.status(400).json({ error: 'Missing _id' });
				break;
			}

			const safeUpdateFields = {};
			Object.keys(updateFields).forEach((key) => {
				if (!key.startsWith('$') && !key.includes('.')) {
					safeUpdateFields[key] = updateFields[key];
				}
			});

			if (Object.keys(safeUpdateFields).length === 0) {
				res.status(400).json({ error: 'No valid fields to update' });
				break;
			}

			let newScore = await db.collection('scores').updateOne(
				{ _id: new ObjectId(_id) },
				{ $set: safeUpdateFields }
			);
			res.json(newScore);
			break;
		}
	}
}
