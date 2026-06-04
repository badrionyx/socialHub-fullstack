package hub.social.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import hub.social.Entity.Comment;

public interface CommentRepo extends JpaRepository<Comment, Long> {
	List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId); // get comments on a post
}