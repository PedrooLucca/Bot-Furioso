import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

type Player = {
    name: string;
    id: number;
};

const BENCHED_START_INDEX = 5;

// Formata as informações dos jogadores em uma string para exibição
const formatPlayerInfo = (players: Player[]): string => {
    return players.map((player, index) => {
        if (index >= BENCHED_START_INDEX && index < players.length - 1) {
            return `• *${player.name}* (BENCHED)`;
        } else if (index === players.length - 1) {
            return `• *${player.name}* (COACH)`;
        } else {
            return `• *${player.name}*`;
        }
    }).join('\n');
};

// Envia uma mensagem para um chat específico usando o bot do Telegram
const sendMessage = (bot: TelegramBot, chatId: number, message: string): void => {
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};

// Lida com o callback para buscar e exibir as informações dos jogadores da FURIA
export const handlePlayersCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        const players = await HLTVService.getFuriaPlayers();
        const playersInfo = formatPlayerInfo(players);
        sendMessage(bot, chatId, `🔥 *Jogadores da FURIA* 🔥\n\n${playersInfo}`);
    } catch (error) {
        console.error('Error fetching FURIA players:', error);
        sendMessage(bot, chatId, '❌ Não foi possível obter informações dos jogadores da FURIA.');
    }
};