package hub.social.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hub.social.Security.JWT_Service;
import hub.social.Service.LikeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LikeController {

	private final LikeService likeService;
	private final JWT_Service jwtService;

	private Long getUserId(String authHeader) {
		return jwtService.extractUserId(authHeader.substring(7));
	}

	@PostMapping("/{postId}")
	public ResponseEntity<String> like(@PathVariable Long postId, @RequestHeader("Authorization") String authHeader) {

		return ResponseEntity.ok(likeService.likePost(postId, getUserId(authHeader)));
	}

	@DeleteMapping("/{postId}")
	public ResponseEntity<String> unlike(@PathVariable Long postId, @RequestHeader("Authorization") String authHeader) {

		return ResponseEntity.ok(likeService.unlikePost(postId, getUserId(authHeader)));
	}

	@GetMapping("/{postId}/count")
	public ResponseEntity<Integer> count(@PathVariable Long postId) {
		return ResponseEntity.ok(likeService.getLikeCount(postId));
	}
}