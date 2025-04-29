import { handleRankingCallback } from '../src/callbacks/rankingCallback';
import TelegramBot from 'node-telegram-bot-api';
import { HLTVService } from '../src/services/HLTVService';

jest.mock('src/services/HLTVService');

const mockedHLTVService = HLTVService as jest.Mocked<typeof HLTVService>;

describe('handleRankingCallback', () => {
    let bot: jest.Mocked<TelegramBot>;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
        sendMessageMock = jest.fn();
        bot = { sendMessage: sendMessageMock } as unknown as jest.Mocked<TelegramBot>;
        jest.clearAllMocks();
    });

    it('should send the FURIA ranking if available', async () => {
        const mockRanking = { position: 5, points: 1000 };

        mockedHLTVService.getFuriaRanking.mockResolvedValueOnce(mockRanking);

        await handleRankingCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('🌍 *Ranking Mundial da FURIA* 🌍'),
            { parse_mode: 'Markdown' }
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('Posição: *5*'),
            expect.any(Object)
        );
        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            expect.stringContaining('Pontos: *1000*'),
            expect.any(Object)
        );
    });

    it('should send a message if FURIA is not in the ranking', async () => {
        mockedHLTVService.getFuriaRanking.mockResolvedValueOnce(null);

        await handleRankingCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '❌ A FURIA não está no ranking mundial atualmente.'
        );
    });

    it('should send an error message if fetching the ranking fails', async () => {
        mockedHLTVService.getFuriaRanking.mockRejectedValueOnce(new Error('API Error'));

        await handleRankingCallback(bot, 12345);

        expect(sendMessageMock).toHaveBeenCalledWith(
            12345,
            '❌ Não foi possível obter o ranking da FURIA.'
        );
    });
});