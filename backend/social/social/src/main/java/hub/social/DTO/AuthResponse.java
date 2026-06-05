package hub.social.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
	private String token; // JWT token
	private String username;
	private Long userId;
}