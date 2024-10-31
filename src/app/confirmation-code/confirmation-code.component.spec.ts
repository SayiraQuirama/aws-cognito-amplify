import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CognitoService } from '../shared/services/cognito/cognito.service';
import { ConfirmationCodeComponent } from './confirmation-code.component';
import { FormControl } from '@angular/forms';

describe('CognitoService', () => {
  let component: ConfirmationCodeComponent;
  let fixture: ComponentFixture<ConfirmationCodeComponent>;
  let cognitoService: CognitoService;

  beforeEach(() => {
    const cognitoServiceMock = {
      handleSignUpConfirmation: jest.fn(),
      assignUserValues: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [ConfirmationCodeComponent],
      providers: [
        { provide: CognitoService, useValue: cognitoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationCodeComponent);
    component = fixture.componentInstance;
    cognitoService = TestBed.inject(CognitoService);
    component.confirmationCode = new FormControl('');
    sessionStorage.setItem('userEmail', 'test@example.com');
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should attempt confirmation with valid confirmation code', async () => {
    component.confirmationCode.setValue('123456');
    const confirmationResponse = { signUpStep: 'DONE' };
    (cognitoService.handleSignUpConfirmation as jest.Mock).mockResolvedValue(confirmationResponse);

    await component.confirmCreatedUser();

    expect(cognitoService.handleSignUpConfirmation).toHaveBeenCalledWith({
      username: 'test@example.com',
      confirmationCode: '123456',
    });
    expect(cognitoService.assignUserValues).toHaveBeenCalledWith(false);
  });

  it('should log confirmation step response if not done', async () => {
    component.confirmationCode.setValue('123456');
    const confirmationResponse = { signUpStep: 'NEXT_STEP' };
    const consoleLogSpy = jest.spyOn(console, 'log');
    (cognitoService.handleSignUpConfirmation as jest.Mock).mockResolvedValue(confirmationResponse);

    await component.confirmCreatedUser();

    expect(consoleLogSpy).toHaveBeenCalledWith('Confirmation step response:', confirmationResponse);
  });

  it('should log an error during confirmation', async () => {
    component.confirmationCode.setValue('123456');
    const errorMessage = 'Error during confirmation';
    const consoleErrorSpy = jest.spyOn(console, 'error');
    (cognitoService.handleSignUpConfirmation as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await component.confirmCreatedUser();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during confirmation:', expect.any(Error));
  });
});