import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState } from 'react'
import { Table } from '@nextui-org/react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
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
			}).then((response) => response.json());

			console.log(data);
			setExtractedText();
			setLoading(false);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

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
					<Table.Column>CHART</Table.Column>
					<Table.Column>ARTIST</Table.Column>
					<Table.Column>CHARTER</Table.Column>
					<Table.Column>SCORE</Table.Column>
					<Table.Column>NOTES HIT</Table.Column>
					<Table.Column>TOTAL NOTES</Table.Column>
				</Table.Header>
				<Table.Body>
					<Table.Row key="1">
						<Table.Cell>A Cruel Angel&apos;s Thesis</Table.Cell>
						<Table.Cell>331Erock</Table.Cell>
						<Table.Cell>Teffy</Table.Cell>
						<Table.Cell>229,407</Table.Cell>
						<Table.Cell>1,028</Table.Cell>
						<Table.Cell>1,132</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>

			{/* <main className="p-5 w-full max-w-4xl mx-auto"> */}
				<h1 className="text-center font-bold text-2xl">Upload Score</h1>

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
									Click on the button below to add an image
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
								<span>Detect text</span>
							)}
						</button>
					</div>

					<div className="w-full max-h-72 overflow-hidden col-span-5 md:col-span-3 border-2 border-green-500 font-semibold text-gray-500 rounded-lg">
						<div className="overflow-y-scroll break-words w-full h-full p-5">
							{extractedText}
						</div>
					</div>
				</form>
			{/* </main> */}
		</>
	)
}
