import { handleStatsCallback } from '../src/callbacks/statsCallback';
import TelegramBot from 'node-telegram-bot-api';
import { HLTVService } from '../src/services/HLTVService';

jest.mock('src/services/HLTVService');

const mockedHLTVService = HLTVService as jest.Mocked<typeof HLTVService>;

describe('handleStatsCallback', () => {
    let bot: jest.Mocked<TelegramBot>;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
        sendMessageMock = jest.fn();
        bot = { sendMessage: sendMessageMock } as unknown as jest.Mocked<TelegramBot>;
        jest.clearAllMocks();
    });

    it('should send player stats if available', async () => {
        const mockPlayers = [
            { name: 'Player1', id: 1 },
            { name: 'Player2', id: 2 }
        ];

        const mockStats = [
            { name: 'Player1', stats: 'Rating: 1.2' },
            { name: 'Player2', stats: 'Rating: 1.1' }
        ];

        mockedHLTVService.getFuriaPlayers.mockResolvedValueOnce(mockPlayers);
        mockedHLTVService.getPlayerStats
            .mockResolvedValueOnce(mockStats[0])
            .mockResolvedValueOnce(mockStats[1]);

        await handleStatsCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('📊 *Estatísticas dos Jogadores da FURIA* 📊'),
            { parse_mode: 'Markdown' }
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('• *Player1*\n  Rating: 1.2'),
            expect.any(Object)
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('• *Player2*\n  Rating: 1.1'),
            expect.any(Object)
        );
    });

    it('should send a message if player stats are unavailable', async () => {
        const mockPlayers = [
            { name: 'Player1', id: 1 },
            { name: 'Player2', id: 2 }
        ];

        mockedHLTVService.getFuriaPlayers.mockResolvedValueOnce(mockPlayers);
        mockedHLTVService.getPlayerStats.mockRejectedValue(new Error('Stats unavailable'));

        await handleStatsCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('• *Player1*\n  Estatísticas indisponíveis.'),
            expect.any(Object)
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('• *Player2*\n  Estatísticas indisponíveis.'),
            expect.any(Object)
        );
    });

    it('should send an error message if fetching players fails', async () => {
        mockedHLTVService.getFuriaPlayers.mockRejectedValueOnce(new Error('API Error'));

        await handleStatsCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '❌ Não foi possível obter as estatísticas dos jogadores da FURIA.'
        );
    });
});