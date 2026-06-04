package hub.social.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "follows",
    uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"})
    // prevents following the same person twice
)
@Getter
@Setter
@NoArgsConstructor
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // The person who clicked "Follow"
    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // The person being followed
    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private User following;
}