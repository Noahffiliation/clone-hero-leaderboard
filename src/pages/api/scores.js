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
			const id = bodyObject._id;
			delete bodyObject._id;

			const safeUpdateFields = {};
			for (const key of Object.keys(bodyObject)) {
				// Disallow MongoDB operator-style keys and nested path keys from user input
				if (typeof key === 'string' && !key.startsWith('$') && !key.includes('.')) {
					safeUpdateFields[key] = bodyObject[key];
				}
			}

			if (!id || Object.keys(safeUpdateFields).length === 0) {
				res.status(400).json({ error: 'Invalid update request' });
				break;
			}

			let newScore = await db.collection('scores').updateOne(
				{ _id: new ObjectId(id) },
				{ $set: safeUpdateFields }
			);
			res.json(newScore);
			break;
		}
	}
}
