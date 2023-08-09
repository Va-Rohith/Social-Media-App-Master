import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {
  followersData: any[] = [];
  followersLength: number = 0;
  followingLength: number = 0;
  userId: any = '';

  constructor(private http: HttpClient, private router: Router) {
    const userId = localStorage.getItem('userId');
    this.userId = userId;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }

    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res: any[]) => {
      this.followersData = res.filter((follow) => follow.userId._id === userId);
      this.followersLength = this.getFollowersLength();
      this.followingLength = this.getFollowingLength();
    });

    // this.http.get<any[]>('http://localhost:5100/follow/userId').subscribe((res: any[]) => {
    //   console.log(res)
    //   // this.followersData = res.filter((follow) => follow.userId._id === userId);
    //   this.followersData = res
    //   this.followersLength = this.getFollowersLength();
    //   this.followingLength = this.getFollowingLength();
    // });
  }

  getFollowersLength(): number {
    let count = 0;
    for (let follower of this.followersData) {
      if (follower.followingId?._id === this.userId) {
        count++;
      }
    }
    return count;
  }

  getFollowingLength(): number {
    let count = 0;
    for (let follower of this.followersData) {
      if (follower.userId?._id === this.userId) {
        count++;
      }
    }
    return count;
  }

  sendMessage(userId: string): void {
    this.router.navigate(['/message', userId]);
  }
}
