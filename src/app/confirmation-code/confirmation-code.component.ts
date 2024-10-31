import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CognitoService } from '../shared/services/cognito/cognito.service';

@Component({
  selector: 'app-confirmation-code',
  templateUrl: './confirmation-code.component.html',
  styleUrl: './confirmation-code.component.scss'
})
export class ConfirmationCodeComponent {
  confirmationCode = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);

  constructor(private cognitoService: CognitoService) {}

  async confirmCreatedUser(): Promise<void> {
    try {
      const username = sessionStorage.getItem('userEmail') ?? '';
      const confirmation = {
        username: username,
        confirmationCode: this.confirmationCode.value ?? ""
      };

      const nextStep: any = await this.cognitoService.handleSignUpConfirmation(confirmation);
  
      if (nextStep?.signUpStep === "DONE") {
        this.cognitoService.assignUserValues(false);
      } else {
        console.log('Confirmation step response:', nextStep);
      }
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  }
}