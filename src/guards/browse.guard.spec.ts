import { Test, TestingModule } from '@nestjs/testing';

import { BrowseGuard } from './browse.guard';
import { ConfigService } from '@nestjs/config';

const configServiceMock = {
  key:  'default',
  port: 3000,
  jwt: {
      active: false,
  },
  basicAuth: {
      active: false,
  },
  permissions: {
      browse: 'browse'
  },
  browser: null
};

let guard: BrowseGuard;

beforeEach(async () => {

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      BrowseGuard,
      {provide: 'ConfigService', useValue: configServiceMock},
    ],
  }).compile()

  guard = module.get<BrowseGuard>(BrowseGuard);
});

describe('BrowseGuard', () => {
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
