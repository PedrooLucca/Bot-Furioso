import { handlePlayersCallback } from '../src/callbacks/playersCallback';
import TelegramBot from 'node-telegram-bot-api';
import { HLTVService } from '../src/services/HLTVService';

jest.mock('src/services/HLTVService');

const mockedHLTVService = HLTVService as jest.Mocked<typeof HLTVService>;

const CHAT_ID = 12345;
const ERROR_MESSAGE = '❌ Não foi possível obter informações dos jogadores da FURIA.';

describe('handlePlayersCallback', () => {
    let bot: jest.Mocked<TelegramBot>;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
        sendMessageMock = jest.fn();
        bot = { sendMessage: sendMessageMock } as unknown as jest.Mocked<TelegramBot>;
        jest.clearAllMocks();
    });

    it('should send a list of players', async () => {
        const mockPlayers = [
            { name: 'Player1', id: 1 },
            { name: 'Player2', id: 2 }
        ];

        mockedHLTVService.getFuriaPlayers.mockResolvedValueOnce(mockPlayers);

        await handlePlayersCallback(bot, CHAT_ID);

        expect(sendMessageMock).toHaveBeenCalledWith(
            CHAT_ID,
            expect.stringContaining('🔥 *Jogadores da FURIA* 🔥'),
            { parse_mode: 'Markdown' }
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            CHAT_ID,
            expect.stringContaining('• *Player1*'),
            expect.any(Object)
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            CHAT_ID,
            expect.stringContaining('• *Player2*'),
            expect.any(Object)
        );
    });

    it('should send an error message if fetching players fails', async () => {
        mockedHLTVService.getFuriaPlayers.mockRejectedValueOnce(new Error('API Error'));

        await handlePlayersCallback(bot, CHAT_ID);

        expect(sendMessageMock).toHaveBeenCalledWith(
            CHAT_ID,
            ERROR_MESSAGE
        );
    });
});