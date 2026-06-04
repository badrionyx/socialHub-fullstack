package hub.social.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hub.social.Entity.Follow;

public interface FollowRepo extends JpaRepository<Follow, Long> {
	Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

	List<Follow> findByFollowerId(Long followerId); // who am I following?

	List<Follow> findByFollowingId(Long followingId); // who follows me?

	int countByFollowerId(Long followerId); // following count

	int countByFollowingId(Long followingId); // followers count
}