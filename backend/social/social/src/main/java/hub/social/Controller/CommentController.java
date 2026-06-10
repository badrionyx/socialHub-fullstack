package hub.social.Controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hub.social.DTO.CommentRequest;
import hub.social.DTO.CommentResponse;
import hub.social.Security.JWT_Service;
import hub.social.Service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;
    private final JWT_Service jwtService;

    private Long getUserId(String authHeader) {
        return jwtService.extractUserId(authHeader.substring(7));
    }

    @PostMapping("/{postId}")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(
            commentService.addComment(postId, request, getUserId(authHeader)));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        commentService.deleteComment(id, getUserId(authHeader));
        return ResponseEntity.ok("Comment deleted");
    }
}