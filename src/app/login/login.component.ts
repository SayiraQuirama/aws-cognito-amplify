import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentUser, signIn } from 'aws-amplify/auth';
import { CognitoService } from '../shared/services/cognito/cognito.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userForm = new FormGroup({
    userEmail: new FormControl('', [Validators.required]),
    userPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  constructor(private router: Router, private cognitoService: CognitoService){}

  ngOnInit() {
    this.checkCurrentUser();
  }

  async checkCurrentUser() {
    try {
      const user = await getCurrentUser();
      if (user) {
        this.router.navigate(['home']);
      }
    } catch (error) {
      console.log('No active session found');
    }
  }

  async login(){
    try {
      const { userEmail, userPassword } = this.userForm.value
      const { nextStep } = await signIn({
        username: userEmail ?? '',
        password: userPassword ?? ''
      });

      const token = await this.cognitoService.currentSession();
      console.log(token.toString);

      if (nextStep.signInStep === "DONE"){
        this.router.navigate(['home'])
      }
    }catch(error){
      console.log(error)
    }
  }
}
