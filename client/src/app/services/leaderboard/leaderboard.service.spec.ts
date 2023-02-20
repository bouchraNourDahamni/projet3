import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
    let service: LeaderboardService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(LeaderboardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
