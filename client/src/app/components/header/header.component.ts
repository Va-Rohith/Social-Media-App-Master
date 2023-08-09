import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  avatar: any = ''
  userId: any = ''
  notification: any[] = []

  constructor(private router: Router, private http: HttpClient) {
    const avatar = localStorage.getItem('userAvatar')
    this.avatar = avatar
    const userId = localStorage.getItem("userId");


    this.http.get<any>(`http://localhost:5100/notifications/${userId}`).subscribe((res: any) => {
      this.notification = res.filter((notification: any) => notification.userId === userId);
      if(res){
        this.userId = res[0].senderId;
      }else{
        this.userId = null
      }
    });
  }

  onDeleteNotifications() {
    this.http.delete('http://localhost:5100/notifications').subscribe((res) => {
      const userId = localStorage.getItem("userId");
      this.http.get<any>(`http://localhost:5100/notifications/${userId}`).subscribe((res: any) => {
      this.notification = res.filter((notification: any) => notification.userId === userId);
      this.userId = res[0].senderId;
    });
    })
  }

  onLogout() {
    localStorage.clear()
    window.alert("You are Loggedout")
    this.router.navigate(['/login'])
  }
}
