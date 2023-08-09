import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  user: any = '';
  senderId: any = ''
  messages: any[] = [];
  messageInput: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router:Router) {

    const token = localStorage.getItem("token")
    if (!token) {
      this.router.navigate(['/login'])
    }

    this.route.params.subscribe(params => {
      this.http.get<any>(`http://localhost:5100/user/${params['id']}`).subscribe((res) => {
        this.user = res;
      });
    });


    const senderId = localStorage.getItem('userId');
    this.senderId = senderId
    this.http.get<any[]>('http://localhost:5100/messages').subscribe((res) => {
      this.messages = res;
    });
  }



  sendComment(userId: string, messageInput: string) {
    const senderId = localStorage.getItem('userId');
    
    this.http.post('http://localhost:5100/messages', { receiverId: userId, senderId, content: messageInput }).subscribe(
      (response) => {
        this.http.get<any[]>('http://localhost:5100/messages').subscribe((res) => {
          this.messages = res.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.messageInput = '';
        });

        this.http.post('http://localhost:5100/notifications',{senderId:senderId,userId:userId,content:messageInput}).subscribe((res) => {
          console.log(res)
        })
      },
      (error) => {
        console.error('Failed to post comment:', error);
      }
    );
  }
  

}
