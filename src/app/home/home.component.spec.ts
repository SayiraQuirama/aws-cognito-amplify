import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { CognitoService } from '../shared/services/cognito/cognito.service';

class MockCognitoService {
  signOut = jest.fn();
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRouter: any;
  let mockCognitoService: MockCognitoService;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockCognitoService = new MockCognitoService();

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CognitoService, useValue: mockCognitoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signOut and navigate to login on logout', async () => {
    await component.logout();

    expect(mockCognitoService.signOut).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);
  });
});