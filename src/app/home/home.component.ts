import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signOut } from 'aws-amplify/auth';
import { CognitoService } from '../shared/services/cognito/cognito.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(private router: Router, private cognitoService: CognitoService) {}

  async logout(){
    await this.cognitoService.signOut();
    this.router.navigate(['login'])
  }
}
