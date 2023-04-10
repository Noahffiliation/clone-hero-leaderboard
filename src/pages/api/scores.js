import clientPromise from '../../../lib/mongodb';

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
	}
}
