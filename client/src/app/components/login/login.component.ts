import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  regForm: FormGroup;

  constructor(private http: HttpClient, private route: Router) {
    this.regForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    })
    
    const token = localStorage.getItem("token")
    console.log(token)
    if (token) {
      this.route.navigate(['/feeds'])
    }
  }

  onSubmit(details = { email: String, password: String }): void {
    this.http.post('http://localhost:5100/login', details).subscribe(
      (response: any) => {
        if(response && response.user){
          localStorage.setItem('userId',response.user._id)
          localStorage.setItem('userAvatar',response.user.avatar)
          localStorage.setItem('userName',response.user.firstname)
          this.route.navigate(['/feeds'])
        }
        if(response && response.token){
          localStorage.setItem('token',response.token)
        }
      },
      (error) => {
        console.error(error);
        window.alert('Login failed! Email or Password is wrong');
      }
    );
  }


}
