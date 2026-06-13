package hub.social.Controller;


import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import hub.social.DTO.PostResponse;
import hub.social.Security.JWT_Service;
import hub.social.Service.PostService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostService postService;
    private final JWT_Service jwtService;

    // Helper — extract userId from token header
    private Long getUserId(String authHeader) {
        String token = authHeader.substring(7); // remove "Bearer "
        return jwtService.extractUserId(token);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader("Authorization") String authHeader)
            throws Exception {

        Long userId = getUserId(authHeader);

        return ResponseEntity.ok(
                postService.createPost(content, file, userId)
        );
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserId(authHeader);
        return ResponseEntity.ok(postService.getAllPosts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserId(authHeader);
        return ResponseEntity.ok(postService.getPostById(id, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {

        Long loggedInUserId = getUserId(authHeader);
        return ResponseEntity.ok(postService.getPostsByUser(userId, loggedInUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserId(authHeader);
        postService.deletePost(id, userId);
        return ResponseEntity.ok("Post deleted");
    }
}