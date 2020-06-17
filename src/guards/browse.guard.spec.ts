import { Test, TestingModule } from '@nestjs/testing';

import { BrowseGuard } from './browse.guard';
import { ConfigService } from '@nestjs/config';

const configServiceMock = {
  
};

let guard: BrowseGuard;

beforeEach(async () => {

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      BrowseGuard,
      {provide: 'CONFIG_OPTIONS', useValue: configServiceMock},
    ],
  }).compile()

  guard = module.get<BrowseGuard>(BrowseGuard);
});

describe('BrowseGuard', () => {
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
