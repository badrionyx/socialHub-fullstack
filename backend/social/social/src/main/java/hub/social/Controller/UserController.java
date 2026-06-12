package hub.social.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import hub.social.DTO.UserResponse;
import hub.social.Security.JWT_Service;
import hub.social.Service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	private final UserService userService;
	private final JWT_Service jwtService;

	private Long getUserId(String authHeader) {
		return jwtService.extractUserId(authHeader.substring(7));
	}

	@GetMapping("/{userId}")
	public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
		return ResponseEntity.ok(userService.getUserById(userId));
	}

	@GetMapping("/search")
	public ResponseEntity<List<UserResponse>> search(@RequestParam String q) {
		if (q == null || q.trim().isEmpty()) {
			return ResponseEntity.ok(List.of());
		}
		return ResponseEntity.ok(userService.searchUsers(q.trim()));
	}

	@PostMapping(value = "/upload-picture", consumes = "multipart/form-data")
	public ResponseEntity<?> uploadPicture(@RequestParam("file") MultipartFile file,
			@RequestHeader("Authorization") String authHeader) {

		if (file == null || file.isEmpty()) {
			return ResponseEntity.badRequest().body("No file selected");
		}

		try {
			Long userId = getUserId(authHeader);
			UserResponse response = userService.uploadProfilePicture(userId, file);
			return ResponseEntity.ok(response);

		} catch (IOException e) {
			return ResponseEntity.status(500).body("File save failed: " + e.getMessage());
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}
