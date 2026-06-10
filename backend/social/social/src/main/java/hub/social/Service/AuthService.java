package hub.social.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import hub.social.DTO.AuthResponse;
import hub.social.DTO.LoginRequest;
import hub.social.DTO.RegisterRequest;
import hub.social.Entity.User;
import hub.social.Repository.UserRepo;
import hub.social.Security.JWT_Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepo userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JWT_Service jwtService;

	public String register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("Email already registered");
		}

		if (userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("Username already taken");
		}

=		User user = new User();
		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());
		// Hash the password — never store plain text!
		user.setPassword(passwordEncoder.encode(request.getPassword()));

		userRepository.save(user);
		return "Registration successful!";
	}

	public AuthResponse login(LoginRequest request) {
		// Find user by email
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Check if password matches the hashed one
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Wrong password");
		}

		// Generate JWT token
		String token = jwtService.generateToken(user.getId(), user.getEmail());

		return new AuthResponse(token, user.getUsername(), user.getId());
	}
}