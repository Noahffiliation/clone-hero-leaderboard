import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState } from 'react'
import { Table } from '@nextui-org/react'

const inter = Inter({ subsets: ['latin'] })

export default function Home({ allScores }) {
	const [imageSrc, setImageSrc] = useState();
	const [loading, setLoading] = useState(false);
	const [extractedText, setExtractedText] = useState("");

	const handleOnChange = (changeEvent) => {
		const reader = new FileReader();

		reader.onload = (onLoadEvent) => {
			setImageSrc(onLoadEvent.target.result);
		};

		reader.readAsDataURL(changeEvent.target.files[0]);
	};

	const handleOnSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { data } = await fetch("/api/cloudinaryApi", {
				method: "POST",
				body: imageSrc
			}).then((response) => response.json())
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});

			console.log(data);
			setExtractedText();
			setLoading(false);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	}

	return (
		<>
			<Head>
				<title>Clone Hero Leaderboard</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<h1 className={styles.title}>
				<span style={{ fontFamily: inter.style.fontFamily }}>
					Clone Hero Leaderboard
				</span>
			</h1>

			<Table
				bordered
				shadow={false}
				aria-label="Example table with static content"
				css={{
					height: "auto",
					minWidth: "100%",
				}}
				selectionMode="single"
			>
				<Table.Header>
					<Table.Column key="chart">Chart</Table.Column>
					<Table.Column key="artist">Artist</Table.Column>
					<Table.Column key="charter">Charter</Table.Column>
					<Table.Column key="score">Score</Table.Column>
					<Table.Column key="percentage">Percentage</Table.Column>
					<Table.Column key="total_notes">Total Notes</Table.Column>
					<Table.Column key="notes_hit">Notes Hit</Table.Column>
					<Table.Column key="notes_missed">Notes Missed</Table.Column>
					<Table.Column key="best_streak">Best Streak</Table.Column>
					<Table.Column key="average_multiplier">Average Multiplier</Table.Column>
					<Table.Column key="overstrums">Overstrums</Table.Column>
				</Table.Header>
				<Table.Body>
					{allScores.data.map((item) => (
						<Table.Row key={item._id}>
							<Table.Cell>{item.chart}</Table.Cell>
							<Table.Cell>{item.artist}</Table.Cell>
							<Table.Cell>{item.charter}</Table.Cell>
							<Table.Cell>{item.score}</Table.Cell>
							<Table.Cell>{item.percentage}</Table.Cell>
							<Table.Cell>{item.total_notes}</Table.Cell>
							<Table.Cell>{item.notes_hit}</Table.Cell>
							<Table.Cell>{item.notes_missed}</Table.Cell>
							<Table.Cell>{item.best_streak}</Table.Cell>
							<Table.Cell>{item.avg_multiplier}</Table.Cell>
							<Table.Cell>{item.overstrums}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>

			<br />

			<h2 className="text-center font-bold text-2xl">Upload Score</h2>

			<form
				action="post"
				onChange={handleOnChange}
				onSubmit={handleOnSubmit}
				className="mt-5 grid gap-5 md:grid-cols-5"
			>
				<div className="w-full h-72 col-span-5 md:col-span-2 flex">
					{imageSrc ? (
						<Image
							src={imageSrc}
							width={1920}
							height={1080}
							alt="uploaded image"
							className="object-contain h-full w-full"
						/>
					) : (
						<span className="self-center flex flex-col space-y-3 p-5">
							<p className="italic">
								Click on the button below to upload a score
							</p>
						</span>
					)}
				</div>

				<div className="w-full col-span-2 md:order-last relative">
					<input
						type="file"
						name="file"
						className="absolute z-10 w-32 h-12 opacity-0"
					/>
				</div>

				<br />

				<div className="w-max col-span-3 justify-self-end md:justify-self-start md:order-last">
					<button
						type="submit"
						className="bg-green-500 text-white rounded-lg shadow-md p-3"
					>
						{loading ? (
							<span className="flex items-center space-x-2">
								Detecting text...
							</span>
						) : (
							<span className="flex items-center space-x-2">
								Detect text
							</span>
						)}
					</button>
				</div>

				<div className="w-full max-h-72 overflow-hidden col-span-5 md:col-span-3 border-2 border-green-500 font-semibold text-gray-500 rounded-lg">
					<div className="overflow-y-scroll break-words w-full h-full p-5">
						{extractedText}
					</div>
				</div>
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
