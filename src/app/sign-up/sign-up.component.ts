import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignUpParameters } from '../shared/interfaces/sign-up-parameters';
import { CognitoService } from '../shared/services/cognito/cognito.service';
import { type ConfirmSignUpInput } from 'aws-amplify/auth';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  signUpUser = new FormGroup({
    userEmail: new FormControl('', [Validators.required]),
    userPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });
  verificationCode = new FormControl('', [Validators.required]);
  needConfirmation = false;

  constructor(private congitoService: CognitoService, private router: Router) {}


  async createUser(): Promise<void> {
    const { userEmail, userPassword } = this.signUpUser.value;

    if(userEmail && userPassword) {
      const user: SignUpParameters = {
        email: userEmail,
        password: userPassword
      };

      const nextStep: any = await this.congitoService.handleSignUp(user);
      sessionStorage.setItem('userEmail', userEmail)

      if(nextStep?.signUpStep === 'CONFIRM_SIGN_UP') this.router.navigate(['confirmation-code']);
    }
  }

  async confirmCreatedUser(): Promise<void> {
    const { userEmail } = this.signUpUser.value;
    const confirmationCode = this.verificationCode.value ?? '';

    if (!confirmationCode) {
      console.error("Verification code is required");
      return;
    }

    const confirmation: ConfirmSignUpInput = {
      username: userEmail ?? '',
      confirmationCode: this.verificationCode.value ?? ''
    };
    const nextStep: any = await this.congitoService.handleSignUpConfirmation(confirmation);

    if(nextStep?.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
      this.congitoService.assignUserValues(false)
    }
  }
}
