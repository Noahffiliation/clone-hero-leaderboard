<h1 align="center">Clone Hero Leaderboard</h1>

<p align="center"> Personal leaderboard for scores in Clone Hero</p>

## Table of Contents
- [About](#about)
- [Installation and Usage](#install_and_usage)
- [Built Using](#built_using)
- [Authors](#authors)

## About <a name = "about"></a>
I just wanted a way to quickly look at my Clone Hero scores in some sort of organized fashion other than looking through a folder of hundreds of screenshots the game automatically takes.

It's just a single page where you can upload a score screenshot and Cloudinary does its best to parse the text in the image to extract score data to save to a database.

## Installation and Usage <a name = "install_and_usage"></a>
1. Clone this repository to your machine with `git clone https://github.com/Noahffiliation/clone-hero-leaderboard.git`
2. Install dependencies with `npm install`
3. Create a `.env.local` file in the root of the project
4. Create a [Cloudinary](https://cloudinary.com/users/register_free) account and add `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET` to `.env.local`
5. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), set up a `clone-hero-scores` database with a `scores` collection, and add the `MONGODB_URI` to `.env.local`

## Built Using <a name = "built_using"></a>
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [NextUI](https://nextui.org/)
- [Cloudinary](https://cloudinary.com/)
- [MongoDB](https://www.mongodb.com/atlas)

## Authors <a name = "authors"></a>
- [@Noahffiliation](https://github.com/Noahffiliation) - Idea & Initial work
