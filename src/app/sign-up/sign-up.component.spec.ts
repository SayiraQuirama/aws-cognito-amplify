import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SignUpComponent } from './sign-up.component';
import { CognitoService } from '../shared/services/cognito/cognito.service';

class MockCognitoService {
  handleSignUp = jest.fn().mockResolvedValue({ signUpStep: 'CONFIRM_SIGN_UP' });
  handleSignUpConfirmation = jest.fn().mockResolvedValue({ signUpStep: 'COMPLETE_AUTO_SIGN_IN' });
  assignUserValues = jest.fn();
}

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let mockRouter: any;
  let cognitoService: Partial<CognitoService>;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    
    await TestBed.configureTestingModule({
      declarations: [SignUpComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    cognitoService = TestBed.inject(CognitoService); 
    fixture.detectChanges();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with two controls', () => {
    expect(component.signUpUser.contains('userEmail')).toBeTruthy();
    expect(component.signUpUser.contains('userPassword')).toBeTruthy();
  });

  it('should require email and password', () => {
    const userEmailControl = component.signUpUser.get('userEmail');
    const userPasswordControl = component.signUpUser.get('userPassword');

    userEmailControl?.setValue('');
    userPasswordControl?.setValue('');
    
    expect(userEmailControl?.valid).toBeFalsy();
    expect(userPasswordControl?.valid).toBeFalsy();
  });

  it('should validate password length', () => {
    const userPasswordControl = component.signUpUser.get('userPassword');
    
    userPasswordControl?.setValue('short');
    expect(userPasswordControl?.valid).toBeFalsy();
    
    userPasswordControl?.setValue('longenough');
    expect(userPasswordControl?.valid).toBeTruthy();
  });

  it('should call createUser and navigate on successful sign up', async () => {
    component.signUpUser.setValue({
      userEmail: 'test@example.com',
      userPassword: 'password123'
    });

    await component.createUser();
    expect(cognitoService.handleSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(sessionStorage.getItem('userEmail')).toBe('test@example.com');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['confirmation-code']);
  });

  it('should call confirmCreatedUser and assign user values', async () => {
    component.signUpUser.setValue({
      userEmail: 'test@example.com',
      userPassword: 'password123'
    });
    component.verificationCode.setValue('123456');

    await component.confirmCreatedUser();
    expect(cognitoService.handleSignUpConfirmation).toHaveBeenCalledWith({
      username: 'test@example.com',
      confirmationCode: '123456'
    });
    expect(cognitoService.assignUserValues).toHaveBeenCalledWith(false);
  });

  it('should handle empty verification code', async () => {
    component.signUpUser.setValue({
      userEmail: 'test@example.com',
      userPassword: 'password123'
    });
    component.verificationCode.setValue('');

    await component.confirmCreatedUser();

    expect(cognitoService.handleSignUpConfirmation).not.toHaveBeenCalled();
  });

  it('should handle empty username', async () => {
    component.signUpUser.setValue({
      userEmail: '',
      userPassword: 'password123'
    });
    component.verificationCode.setValue('123456');

    await component.confirmCreatedUser();

    expect(cognitoService.handleSignUpConfirmation).toHaveBeenCalledWith({
      username: '',
      confirmationCode: '123456'
    });
  });
});