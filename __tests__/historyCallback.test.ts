import { handleHistoryCallback } from '../src/callbacks/historyCallback';
import TelegramBot from 'node-telegram-bot-api';
import { HLTVService } from '../src/services/HLTVService';

jest.mock('src/services/HLTVService');

const mockedHLTVService = HLTVService as jest.Mocked<typeof HLTVService>;

describe('handleHistoryCallback', () => {
    let bot: jest.Mocked<TelegramBot>;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
        sendMessageMock = jest.fn();
        bot = { sendMessage: sendMessageMock } as unknown as jest.Mocked<TelegramBot>;
        jest.clearAllMocks();
    });

    it('should send match history if available', async () => {
        const mockHistory = [
            { id: 1, team1: { name: 'FURIA', logo: 'logo1.png' }, team2: { name: 'Team2', logo: 'logo2.png' }, date: 1234567890, stars: 3, format: 'BO3', result: { team1: 16, team2: 12 } },
            { id: 2, team1: { name: 'FURIA', logo: 'logo1.png' }, team2: { name: 'Team3', logo: 'logo3.png' }, date: 1234567891, stars: 2, format: 'BO1', result: { team1: 8, team2: 16 } }
        ];

        mockedHLTVService.getFuriaMatchHistory.mockResolvedValueOnce(mockHistory);

        await handleHistoryCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('📜 *Histórico de Partidas da FURIA* 📜'),
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

    it('should send a message if no match history is available', async () => {
        mockedHLTVService.getFuriaMatchHistory.mockResolvedValueOnce([]);

        await handleHistoryCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '📜 Não há histórico de partidas disponível para a FURIA.'
        );
    });

    it('should send an error message if fetching match history fails', async () => {
        mockedHLTVService.getFuriaMatchHistory.mockRejectedValueOnce(new Error('API Error'));

        await handleHistoryCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '❌ Não foi possível obter o histórico de partidas da FURIA.'
        );
    });
});