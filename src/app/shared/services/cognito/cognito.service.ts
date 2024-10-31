import { Injectable } from '@angular/core';
import { signUp, confirmSignUp, type ConfirmSignUpInput, autoSignIn, signIn, type SignInInput, signOut, getCurrentUser, fetchAuthSession, JWT } from 'aws-amplify/auth';
import { SignUpParameters } from '../../interfaces/sign-up-parameters';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  constructor(private router: Router) { }

  async handleSignUp({ email, password }: SignUpParameters) {
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: false
        }
      });
      return nextStep;
    } catch (error) {
      alert(error);
      return error;
    }
  }

  async handleSignUpConfirmation({ username, confirmationCode }: ConfirmSignUpInput) {
    try {  
      const result = await confirmSignUp({ username, confirmationCode });  
      return result?.nextStep;
    } catch (error) {
      console.error('Error in handleSignUpConfirmation:', error);
      alert('Error confirming the signup: ' + error);
      return error;
    }
  }

  async currentSession(): Promise<String> {
    try {
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log(idToken);
      return idToken?.toString() ?? '';
    } catch (error) {
      alert(error);
      return error as any;
    }
  }

  async currentAuthenticatedUser(): Promise<{username: string, userId: string}> {
    try {
      const { username, userId } = await getCurrentUser();
      const userInfo = {
        username,
        userId
      }

      return userInfo;
    } catch (error) {
      alert(error);
      return {} as any;
    }
  }

  async assignUserValues(isSignedIn: boolean) {
    if(isSignedIn) {
      const token = await this.currentSession();
      sessionStorage.setItem('session_token', JSON.stringify(token));

      const { username, userId } = await this.currentAuthenticatedUser();

      sessionStorage.setItem('user_id', userId);
      sessionStorage.setItem('user_name', username);
      // this.router.navigate(['login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async signOut() {
    try {
      await signOut({ global: true });
      console.log('usuario desconectado');
    } catch (error) {
      console.log(`error al cerrar sesión: ${error}`);
    }
  }

}
