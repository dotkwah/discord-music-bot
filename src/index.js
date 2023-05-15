const { Client, IntentsBitField } = require('discord.js');
const ytdl = require('ytdl-core');
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

const musicQueue = [];
const musicTitleQueue = [];
var musicTitleList = '';
var currentSong = '';

var isPlaying = false;

const player = createAudioPlayer();

async function handleMusicTitle() {
	const info = await ytdl.getInfo(currentSong);
	const title = info.videoDetails.title;
	musicTitleQueue.push(title);

	musicTitleQueue.forEach((titleList) => {
		musicTitleList = musicTitleList + titleList + '\n';
	});
}

async function playSong(message) {
	const connection = await joinVoiceChannel({
		channelId: message.member.voice.channel.id,
		guildId: message.guild.id,
		adapterCreator: message.guild.voiceAdapterCreator,
	});
	if (currentSong !== '') {
		isPlaying = true;
		const stream = ytdl(currentSong, { filter: 'audioonly' }, { quality: '94' });
		const resource = createAudioResource(stream);

		await player.play(resource);
		connection.subscribe(player);
	}
	else {
		message.reply('There are no songs in the queue.');
	}
}

async function stopSong() {
	await player.stop();
}

async function pauseSong() {
	await player.pause();
}

async function resumeSong() {
	await player.unpause();
}

client.on('messageCreate', async message => {
	if (message.content.startsWith('!play')) {
		const args = message.content.slice(5).trim().split(/ +/) || '';
		const url = args[0] || '';

		if (!url) {
			return message.reply('Please provide a video URL.');
		}

		const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
		if (!youtubeRegex.test(url)) {
			return message.reply('Invalid YouTube URL.');
		}

		musicQueue.push(url);
		if (!currentSong) {
			currentSong = musicQueue.shift();
		}

		const voiceChannel = message.member.voice.channel;

		if (!voiceChannel) {
			return message.reply('You need to be in a voice channel to play music!');
		}

		try {
			if (!isPlaying) {
				playSong(message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	if (message.content.startsWith('!skip')) {
		currentSong = musicQueue.shift();
		if (!currentSong) {
			message.reply('There are no songs in the queue.');
			stopSong();
			isPlaying = false;
		}
		else if (currentSong) {
			message.reply(`Now playing: ${currentSong}`);
			playSong(message);
		}
	}

	if (message.content.startsWith('!pause')) {
		pauseSong();
	}

	if (message.content.startsWith('!resume')) {
		resumeSong();
	}
});

client.login(process.env.DISCORD_TOKEN);
