package hub.social.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hub.social.Entity.User;

public interface UserRepo extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email); 

	Optional<User> findByUsername(String username); 

	boolean existsByEmail(String email); 

	boolean existsByUsername(String username); 
}