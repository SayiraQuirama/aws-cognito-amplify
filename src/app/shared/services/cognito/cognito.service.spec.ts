import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CognitoService } from './cognito.service';
import { signUp, confirmSignUp, autoSignIn, getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';

jest.mock('aws-amplify/auth', () => ({
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  autoSignIn: jest.fn(),
  getCurrentUser: jest.fn(),
  fetchAuthSession: jest.fn(),
  signOut: jest.fn(),
}));

describe('CognitoService', () => {
  let service: CognitoService;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CognitoService,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(CognitoService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiar mocks despuÃ©s de cada prueba
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleSignUp', () => {
    it('should call signUp and return nextStep', async () => {
      const signUpResponse = { nextStep: 'NEXT_STEP' };
      (signUp as jest.Mock).mockResolvedValue(signUpResponse);

      const result = await service.handleSignUp({ email: 'test@example.com', password: 'password' });

      expect(signUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password',
        options: {
          userAttributes: {
            email: 'test@example.com',
          },
          autoSignIn: false,
        },
      });
      expect(result).toBe('NEXT_STEP');
    });

    it('should alert error on signUp failure', async () => {
      const errorMessage = 'Error during sign up';
      (signUp as jest.Mock).mockRejectedValue(new Error(errorMessage));
      global.alert = jest.fn(); // Mock alert

      const result = await service.handleSignUp({ email: 'test@example.com', password: 'password' });

      expect(global.alert).toHaveBeenCalled();
      expect(result).toEqual(new Error(errorMessage));
    });
  });

  describe('handleSignUpConfirmation', () => {
    it('should call confirmSignUp and return nextStep', async () => {
      const confirmSignUpResponse = { nextStep: 'CONFIRM_STEP' };
      (confirmSignUp as jest.Mock).mockResolvedValue(confirmSignUpResponse);

      const result = await service.handleSignUpConfirmation({ username: 'test@example.com', confirmationCode: '123456' });

      expect(confirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });
      expect(result).toBe('CONFIRM_STEP');
    });

    it('should alert error on confirmation failure', async () => {
      const errorMessage = 'Error during confirmation';
      (confirmSignUp as jest.Mock).mockRejectedValue(new Error(errorMessage));
      global.alert = jest.fn(); // Mock alert

      const result = await service.handleSignUpConfirmation({ username: 'test@example.com', confirmationCode: '123456' });

      expect(global.alert).toHaveBeenCalled();
      expect(result).toEqual(new Error(errorMessage));
    });
  });

  describe('currentAuthenticatedUser', () => {
    it('should return user information when successful', async () => {
      const userInfo = { username: 'testUser', userId: '12345' };
      (getCurrentUser as jest.Mock).mockResolvedValue(userInfo);
  
      const result = await service.currentAuthenticatedUser();
  
      expect(result).toEqual(userInfo);
      expect(getCurrentUser).toHaveBeenCalled();
    });
  
    it('should return an empty object when an error occurs', async () => {
      (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Error getting user'));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  
      const result = await service.currentAuthenticatedUser();
  
      expect(result).toEqual({});
      expect(alertSpy).toHaveBeenCalled();
    });
  });
  
  describe('currentSession', () => {
    it('should return idToken when successful', async () => {
      const mockToken = 'mockIdToken';
      (fetchAuthSession as jest.Mock).mockResolvedValue({ tokens: { idToken: mockToken } });
  
      const result = await service.currentSession();
  
      expect(result).toBe(mockToken);
      expect(fetchAuthSession).toHaveBeenCalled();
    });
  
    it('should return an empty string when idToken is not available', async () => {
      (fetchAuthSession as jest.Mock).mockResolvedValue({ tokens: null });
  
      const result = await service.currentSession();
  
      expect(result).toBe('');
    });
  
    it('should alert error when fetching session fails', async () => {
      (fetchAuthSession as jest.Mock).mockRejectedValue(new Error('Error fetching session'));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  
      const result = await service.currentSession();
  
      expect(result).toEqual(new Error('Error fetching session'));
      expect(alertSpy).toHaveBeenCalled();
    });
  });
  
  describe('assignUserValues', () => {
    it('should store user values in session storage when signed in', async () => {
      jest.spyOn(service, 'currentSession').mockResolvedValue('fake_token');
      jest.spyOn(service, 'currentAuthenticatedUser').mockResolvedValue({ username: 'testUser', userId: '12345' });

      await service.assignUserValues(true);

      expect(sessionStorage.getItem('session_token')).toBe('"fake_token"');
      expect(sessionStorage.getItem('user_id')).toBe('12345');
      expect(sessionStorage.getItem('user_name')).toBe('testUser');
    });

    it('should navigate to login if not signed in', async () => {
      await service.assignUserValues(false);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('signOut', () => {
    it('should call signOut', async () => {
      await service.signOut();

      expect(signOut).toHaveBeenCalledWith({ global: true });
    });

    it('should log error on signOut failure', async () => {
      const errorMessage = 'Error signing out';
      (signOut as jest.Mock).mockRejectedValue(new Error(errorMessage));
      console.log = jest.fn(); // Mock console.log

      await service.signOut();

      expect(console.log).toHaveBeenCalled();
    });
  });
});