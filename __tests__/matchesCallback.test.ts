import { handleMatchesCallback } from '../src/callbacks/matchesCallback';
import TelegramBot from 'node-telegram-bot-api';
import { HLTVService } from '../src/services/HLTVService';

jest.mock('src/services/HLTVService');

const mockedHLTVService = HLTVService as jest.Mocked<typeof HLTVService>;

describe('handleMatchesCallback', () => {
    let bot: jest.Mocked<TelegramBot>;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
        sendMessageMock = jest.fn();
        bot = { sendMessage: sendMessageMock } as unknown as jest.Mocked<TelegramBot>;
        jest.clearAllMocks();
    });

    it('should send upcoming matches if available', async () => {
        const mockMatches = [
            { id: 1, team1: { name: 'FURIA' }, team2: { name: 'Team2' }, date: 1234567890, live: false, stars: 3 },
            { id: 2, team1: { name: 'FURIA' }, team2: { name: 'Team3' }, date: 1234567891, live: true, stars: 2 }
        ];

        mockedHLTVService.getUpcomingMatches.mockResolvedValueOnce(mockMatches);

        await handleMatchesCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('🏆 *Próximas Partidas da FURIA* 🏆'),
            { parse_mode: 'Markdown' }
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('FURIA vs Team2'),
            expect.any(Object)
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('FURIA vs Team3'),
            expect.any(Object)
        );
    });

    it('should send a message if no upcoming matches are available', async () => {
        mockedHLTVService.getUpcomingMatches.mockResolvedValueOnce([]);

        await handleMatchesCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '🏆 Não há partidas futuras agendadas para a FURIA.'
        );
    });

    it('should send an error message if fetching upcoming matches fails', async () => {
        mockedHLTVService.getUpcomingMatches.mockRejectedValueOnce(new Error('API Error'));

        await handleMatchesCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '❌ Não foi possível obter as próximas partidas.'
        );
    });
});