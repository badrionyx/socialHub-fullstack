package hub.social.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hub.social.DTO.PostResponse;
import hub.social.Security.JWT_Service;
import hub.social.Service.FollowService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
public class FollowController {

    private final FollowService followService;
    private final JWT_Service jwtService;

    private Long getUserId(String authHeader) {
        return jwtService.extractUserId(authHeader.substring(7));
    }

    @PostMapping("/follows/{userId}")
    public ResponseEntity<String> follow(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(followService.follow(userId, getUserId(authHeader)));
    }

    @DeleteMapping("/follows/{userId}")
    public ResponseEntity<String> unfollow(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(followService.unfollow(userId, getUserId(authHeader)));
    }

    // Get followers list
    @GetMapping("/follows/{userId}/followers")
    public ResponseEntity<List<String>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    // Get following list
    @GetMapping("/follows/{userId}/following")
    public ResponseEntity<List<String>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed(
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(followService.getFeed(getUserId(authHeader)));
    }
}