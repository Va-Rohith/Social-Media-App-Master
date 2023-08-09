import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  regForm: FormGroup;

  constructor(private http: HttpClient, private route: Router) {
    this.regForm = new FormGroup({
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      username: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      avatar:new FormControl(null)
    })

    const token = localStorage.getItem("jwtToken")
    if (token) {
      this.route.navigate(['/feeds'])
    }
  }

  onSubmit(details: { firstname: string, lastname: string, username: string, email: string, password: string }): void {
    this.http.post('http://localhost:5100/register', details)
      .subscribe(
        (res: any) => {
          if (res.message === 'Successfully Registered') {
            window.alert('Registration Successful!');
            this.route.navigate(['/login']);
          } else {
            window.alert('Registration Failed!');
          }
        },
        (error) => {
          console.error(error);
          window.alert('Registration Failed!');
        }
      );
  }
  
  



}
