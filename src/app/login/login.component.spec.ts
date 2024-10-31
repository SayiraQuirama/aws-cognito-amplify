import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { CognitoService } from '../shared/services/cognito/cognito.service';
import { of } from 'rxjs';
import { getCurrentUser, signIn } from 'aws-amplify/auth';

jest.mock('aws-amplify/auth');

class MockCognitoService {
  currentSession = jest.fn().mockResolvedValue({ getIdToken: () => ({ getJwtToken: () => 'mockToken' }) });
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CognitoService, useClass: MockCognitoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to home if a user is currently logged in', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce({})

    await component.checkCurrentUser();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should not navigate if no user is logged in', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('No active session found'));

    await component.checkCurrentUser();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should call signIn and navigate to home on successful login', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    component.userForm.setValue({ userEmail: mockEmail, userPassword: mockPassword });

    (signIn as jest.Mock).mockResolvedValueOnce({ nextStep: { signInStep: 'DONE' } });

    await component.login();

    expect(signIn).toHaveBeenCalledWith({ username: mockEmail, password: mockPassword });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should log error on login failure', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    const mockEmail = 'test@example.com';
    const mockPassword = 'wrongPassword';
    component.userForm.setValue({ userEmail: mockEmail, userPassword: mockPassword });

    (signIn as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

    await component.login();

    expect(signIn).toHaveBeenCalledWith({ username: mockEmail, password: mockPassword });
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
  });
});