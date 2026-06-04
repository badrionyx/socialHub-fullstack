package hub.social.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hub.social.Entity.Like;

public interface LikeRepo extends JpaRepository<Like, Long> {
	Optional<Like> findByUserIdAndPostId(Long userId, Long postId); // check if liked

	int countByPostId(Long postId); // count likes
}