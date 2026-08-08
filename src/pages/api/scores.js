import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const sanitize = (obj) => {
	const map = new Map();
	const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);
	Object.keys(obj || {}).forEach((key) => {
		if (
			!key.startsWith('$') &&
			!key.includes('.') &&
			!forbiddenKeys.has(key)
		) {
			map.set(key, obj[key]);
		}
	});
	return Object.fromEntries(map);
};

const parseBody = (body) => {
	if (typeof body === 'object' && body !== null) return body;
	try {
		return JSON.parse(body);
	} catch {
		return {};
	}
};

export default async function handler(req, res) {
	const client = await clientPromise;
	const db = client.db('clone-hero-scores');
	switch (req.method) {
		case 'POST': {
			const bodyObject = parseBody(req.body);
			const safeBody = sanitize(bodyObject);
			if (Object.keys(safeBody).length === 0) {
				return res.status(400).json({ error: 'No valid fields provided' });
			}
			const myScore = await db.collection('scores').insertOne(safeBody);
			return res.status(200).json(myScore);
		}
		case 'GET': {
			const allScores = await db.collection('scores').find().toArray();
			return res.status(200).json({ status: 200, data: allScores });
		}
		case 'PUT': {
			const bodyObject = parseBody(req.body);
			const { _id, ...updateFields } = bodyObject;

			if (!_id) {
				return res.status(400).json({ error: 'Missing _id' });
			}

			let objectId;
			try {
				objectId = new ObjectId(_id);
			} catch {
				return res.status(400).json({ error: 'Invalid _id format' });
			}

			const safeUpdateFields = sanitize(updateFields);

			if (Object.keys(safeUpdateFields).length === 0) {
				return res.status(400).json({ error: 'No valid fields to update' });
			}

			const newScore = await db.collection('scores').updateOne(
				{ _id: objectId },
				{ $set: safeUpdateFields }
			);
			return res.status(200).json(newScore);
		}
		default: {
			res.setHeader('Allow', ['GET', 'POST', 'PUT']);
			return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
		}
	}
}
