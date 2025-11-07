const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Quran Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const Discord = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
let player;

async function playQuran() {
    try {
        let resource = createAudioResource('./quran.mp3', {
            inlineVolume: true
        });

        if (player) {
            player.play(resource);
            console.log('Playing Quran...');
        }
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

async function setupQuran() {
    let ch = client.channels.cache.get(process.env.qch);

    if (!ch) {
        console.error('Channel not found! Check your qch environment variable.');
        return;
    }

    console.log(`Attempting to connect to channel: ${ch.name}`);

    try {
        connection = joinVoiceChannel({
            channelId: ch.id,
            guildId: ch.guild.id,
            adapterCreator: ch.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        // Wait for connection to be ready
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        console.log('Voice connection is ready!');

        player = createAudioPlayer();
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Audio is playing!');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Audio finished, looping...');
            setTimeout(() => playQuran(), 1000);
        });

        player.on('error', error => {
            console.error('Player error:', error);
        });

        connection.on('error', error => {
            console.error('Connection error:', error);
        });

        playQuran();

    } catch (error) {
        console.error('Failed to connect to voice channel:', error.message);
    }
}

client.on("ready", () => {
    console.log(`Quran Bot is Started`);
    console.log(`[NAME] ${client.user.tag}`);
    console.log(`[ID] ${client.user.id}`);
    console.log(`[GUILDS] ${client.guilds.cache.size}`);
    console.log(`( All Copyrights Go To ZombieX )`);

    setupQuran();
});

client.login(process.env.token);