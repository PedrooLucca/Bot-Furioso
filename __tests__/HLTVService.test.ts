import { HLTVService } from '../src/services/HLTVService';
import CacheService from '../src/services/CacheService';
import HLTV from 'hltv';

jest.mock('hltv');

const mockedHLTV = HLTV as jest.Mocked<typeof HLTV>;

describe('HLTVService', () => {
    beforeEach(() => {
        CacheService.flush();
        jest.clearAllMocks();
    });

    it('should fetch and cache Furia team info', async () => {
        const mockTeamInfo = {
            name: 'FURIA',
            id: 8297,
            players: [{ name: 'Player1', id: 1 }, { name: 'Player2', id: 2 }]
        };

        mockedHLTV.getTeam.mockResolvedValueOnce({
            name: 'FURIA',
            id: 8297,
            players: [{ name: 'Player1', id: 1 }, { name: 'Player2', id: 2 }]
        } as any);

        const teamInfo = await HLTVService.getFuriaTeamInfo();
        expect(teamInfo).toEqual(mockTeamInfo);
        expect(CacheService.get('furiaTeamInfo')).toEqual(mockTeamInfo);
    });

    it('should return cached Furia team info if available', async () => {
        const mockTeamInfo = {
            name: 'FURIA',
            id: 8297,
            players: [{ name: 'Player1', id: 1 }, { name: 'Player2', id: 2 }]
        };

        CacheService.set('furiaTeamInfo', mockTeamInfo);

        const teamInfo = await HLTVService.getFuriaTeamInfo();
        expect(teamInfo).toEqual(mockTeamInfo);
        expect(mockedHLTV.getTeam).not.toHaveBeenCalled();
    });

    it('should fetch and cache upcoming matches', async () => {
        const mockMatches = [
            { team1: { name: 'FURIA', id: 8297 }, team2: { name: 'Team2', id: 2 }, date: 1234567890 }
        ];

        mockedHLTV.getMatches.mockResolvedValueOnce(mockMatches as any);

        const matches = await HLTVService.getUpcomingMatches();
        expect(matches).toEqual(mockMatches);
        expect(CacheService.get('upcomingMatches')).toEqual(mockMatches);
    });

    it('should return cached upcoming matches if available', async () => {
        const mockMatches = [
            { team1: { name: 'FURIA', id: 8297 }, team2: { name: 'Team2', id: 2 }, date: 1234567890 }
        ];

        CacheService.set('upcomingMatches', mockMatches);

        const matches = await HLTVService.getUpcomingMatches();
        expect(matches).toEqual(mockMatches);
        expect(mockedHLTV.getMatches).not.toHaveBeenCalled();
    });
});