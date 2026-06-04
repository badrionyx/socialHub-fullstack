package hub.social.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String content;

    private String imageUrl;       // optional image on the post

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Many posts belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)  // creates user_id column in posts table
    private User user;

    // One post has many comments
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments;

    // One post has many likes
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Like> likes;
}