import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  regForm: FormGroup;
  storyForm: FormGroup
  avatar: any = '';
  name: any = '';
  userId: any = '';
  posts: any[] = [];
  showCommentInput: boolean = false;
  content: string = '';
  comments: any[] = [];
  likes: any[] = [];
  followersData: any[] = [];
  stories: any[] = []
  showComments = false

  post: any = {
    _id: 1,
    commentInput: ''
  };

  constructor(private http: HttpClient, private route: Router) {
    this.regForm = new FormGroup({
      content: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      mediaUrl: new FormControl(null, Validators.required)
    })


    this.storyForm = new FormGroup({
      title:new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      mediaUrl: new FormControl(null, Validators.required)
    })


    

    const token = localStorage.getItem("token")
    if (!token) {
      this.route.navigate(['/login'])
    }

    this.http.get<any[]>('http://localhost:5100/comments').subscribe((res) => {
      this.comments = res
    })

    this.http.get<any[]>('http://localhost:5100/likes').subscribe((res) => {
      this.likes = res
    })

    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res
    })

    this.http.get<any[]>('http://localhost:5100/stories').subscribe((res) => {
      this.stories = res
      
    })



    const avatar = localStorage.getItem('userAvatar')
    this.avatar = avatar
    const name = localStorage.getItem('userName')
    this.name = name
    const userId = localStorage.getItem("userId")
    this.userId = userId

    // this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
    //   this.posts = res;
    // });

    this.http.get<any[]>(`http://localhost:5100/posts/`).subscribe((res) => {
      this.posts = res;
      console.log(res)
    });


  }

  
  onShowComments(){
    this.showComments = !this.showComments
  }

  onSubmit(details = { mediaUrl: String, content: String,description:String }): void {
    const post = {
      userId: this.userId,
      mediaUrl: details.mediaUrl,
      content: details.content,
      description:details.description,
      mediaType: 'Image',
    }
    this.http.post('http://localhost:5100/posts', post)
      .subscribe(
        response => {
          alert("Post Successfully Posted!")
          console.log('Post successful:', response);
          this.http.get<any[]>(`http://localhost:5100/posts/`).subscribe((res) => {
            this.posts = res;
          });
        },
        error => {
          alert("Post Failed!")
          console.error('Error posting:', error);
        }
      );
  }





  dislikePost(post: any): void {
    post.isLiked = !post.isLiked;
    const dislikeData = {
      postId: post._id,
    };

    this.http.post(`http://localhost:5100/dislike/${dislikeData.postId}`, dislikeData)
      .subscribe(
        (res: any) => {
          alert("dislike")
        },
        (error) => {
          console.error(error);
        }
      );
  }


  likePost(postId: string): void {
    this.http.put(`http://localhost:5100/posts/${postId}/likes`, {})
      .subscribe(
        (res: any) => {
          this.http.get<any[]>(`http://localhost:5100/posts`).subscribe((res) => {
            this.posts = res;
          });
        },
        (error) => {
          console.error(error);
          alert("Failed");
        }
      );
  }


  followUser(post: any) {
    const postDetails = {
      userId: this.userId,
      followingId: post.userId._id
    }
    this.http.post(`http://localhost:5100/follow`, postDetails).subscribe((res) => {
      alert(`You Followed ${post.userId.username}`)
    })

    this.http.get<any[]>(`http://localhost:5100/posts`).subscribe((res) => {
            this.posts = res;
          });

    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res
    })
  }

  unfollowUser(post: any): void {
    const followingId = post.userId._id;
    const followerId = localStorage.getItem('userId')
    this.http.delete(`http://localhost:5100/follow/${followingId}/${followerId}`).subscribe(
      response => {
        console.log(response);
        alert(`You unfollowed ${post.userId.username}`);
        this.refreshFollowersData();
          // Retrieve the updated posts after unfollowing
          this.http.get<any[]>(`http://localhost:5100/posts`).subscribe((res) => {
            this.posts = res;
          });
      },
      error => {
        console.error(error);
      }
    );
  }
  
  

  refreshFollowersData(): void {
    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res;
    });
  }


  sendComment(postId: string, commentInput: string) {
    this.http.post('http://localhost:5100/comments', { userId: this.userId, postId, content: commentInput }).subscribe(
      (response) => {
        this.http.get<any[]>('http://localhost:5100/comments').subscribe((res) => {
          this.comments = res
          this.post.commentInput = '';
          this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
            this.posts = res;
          });

        })
      },
      (error) => {
        console.error('Failed to post comment:', error);
      }
    );
  }

  clearCommentInput() {
    // Clear the comment input field
    this.post.commentInput = '';
  }

  uploadStory(details: { title: string, mediaUrl: string, description: string }): void {
    const story = {
      userId: this.userId,
      title: details.title,
      description: details.description,
      imageUrl: details.mediaUrl,
    };
  
    this.http.post('http://localhost:5100/stories', story).subscribe(
      response => {
        alert('Post Successfully Posted!');
        console.log('Post successful:', response);
        this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe(res => {
          this.posts = res;
        });
      },
      error => {
        alert('Post Failed!');
        console.error('Error posting:', error);
      }
    );
  }
}
