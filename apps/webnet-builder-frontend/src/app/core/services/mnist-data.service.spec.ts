import { TestBed } from '@angular/core/testing';

import { MnistDataService } from './mnist-data.service';

describe('MnistDataService', () => {
  let service: MnistDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnistDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
