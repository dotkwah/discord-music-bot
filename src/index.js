const { Client, IntentsBitField } = require('discord.js');
const ytdl = require('ytdl-core');
// const scrapeIt = require('scrape-it');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
require('dotenv').config();

const myItents = new IntentsBitField();
myItents.add(
	IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.GuildMembers,
	IntentsBitField.Flags.GuildMessages,
	IntentsBitField.Flags.MessageContent,
	IntentsBitField.Flags.GuildVoiceStates,
);

const client = new Client({ intents: myItents });

client.once('ready', (c) => {
	console.log(`${c.user.tag} is ready!`);
});

client.on('messageCreate', async message => {
	if (message.content.startsWith('!play')) {
		const args = message.content.slice(5).trim().split(/ +/);
		const url = args[0];

		if (!url) {
			return message.reply('Please provide a video URL.');
		}

		const voiceChannel = message.member.voice.channel;

		if (!voiceChannel) {
			return message.reply('You need to be in a voice channel to play music!');
		}

		try {
			const connection = await joinVoiceChannel({
				channelId: message.member.voice.channel.id,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator,
			});

			const stream = ytdl(url, { filter: 'audioonly' }, { quality: '94' });

			const player = createAudioPlayer();
			const resource = createAudioResource(stream);

			// eslint-disable-next-line no-inner-declarations
			async function play() {
				await player.play(resource);
				connection.subscribe(player);
			}

			play();

		}
		catch (error) {
			console.error(error);
		}
	}
});

client.login(process.env.DISCORD_TOKEN);

// client.on('message', async message => {
// 	if (message.content.startsWith('!play')) {
// 		const args = message.content.slice(5).trim().split(/ +/);
// 		const url = args[0];

// 		if (!url) {
// 			return message.reply('Please provide a video URL.');
// 		}

// 		const voiceChannel = message.member.voice.channel;

// 		if (!voiceChannel) {
// 			return message.reply('You need to be in a voice channel to play music!');
// 		}

// 		let stream;

// 		// Check if the URL is a YouTube link
// 		if (ytdl.validateURL(url)) {
// 			stream = ytdl(url, { filter: 'audioonly' });
// 		}
// 		else if (url.includes('fmovies')) {
// 			try {
// 				// Scrape the FMovies page to get the video URL
// 				const { data } = await scrapeIt(url, {
// 					video: {
// 						selector: 'iframe#iframe-embed',
// 						attr: 'src',
// 					},
// 				});

// 				stream = data.video ? data.video : null;
// 			}
// 			catch (error) {
// 				console.error(error);
// 				return message.channel.send('Error retrieving video URL from FMovies.');
// 			}
// 		}
// 		else {
// 			return message.channel.send('Invalid video URL.');
// 		}

// 		try {
// 			const connection = await voiceChannel.join();
// 			const dispatcher = connection.play(stream);

// 			dispatcher.on('start', () => {
// 				message.channel.send(`Now playing: ${url}`);
// 			});

// 			dispatcher.on('finish', () => {
// 				voiceChannel.leave();
// 			});

// 			dispatcher.on('error', error => {
// 				console.error(error);
// 				message.channel.send('Error playing video.');
// 				voiceChannel.leave();
// 			});
// 		}
// 		catch (error) {
// 			console.error(error);
// 			message.channel.send('Error joining voice channel.');
// 		}
// 	}
// });

// client.login(process.env.DISCORD_TOKEN);