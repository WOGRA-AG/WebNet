import { TestBed } from '@angular/core/testing';

import { ModelWrapperService } from './model-wrapper.service';

describe('ModelWrapperService', () => {
  let service: ModelWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
