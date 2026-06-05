package hub.social.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hub.social.Entity.Post;

public interface PostRepo extends JpaRepository<Post, Long> {
	List<Post> findByUserIdOrderByCreatedAtDesc(Long userId); // get posts by user

	List<Post> findAllByOrderByCreatedAtDesc();
}