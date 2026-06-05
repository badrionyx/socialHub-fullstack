package hub.social.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor    
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // auto increment
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;    // will store hashed password in Step 3

    private String bio;

    private String profilePicture;   // stores image file name

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist   // runs automatically before saving to DB
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // One user has many posts...
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts;

    // One user has many comments
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Comment> comments;

    // One user has many likes
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Like> likes;
}