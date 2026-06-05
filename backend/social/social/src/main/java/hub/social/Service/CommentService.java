package hub.social.Service;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import hub.social.DTO.CommentRequest;
import hub.social.DTO.CommentResponse;
import hub.social.Entity.Comment;
import hub.social.Entity.Post;
import hub.social.Entity.User;
import hub.social.Repository.CommentRepo;
import hub.social.Repository.PostRepo;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepo commentRepository;
    private final PostRepo postRepository;
    private final UserRepo userRepository;

    public CommentResponse addComment(Long postId, CommentRequest request, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setPost(post);
        comment.setUser(user);

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    public List<CommentResponse> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // Helper
    private CommentResponse mapToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUserId(comment.getUser().getId());
        response.setUsername(comment.getUser().getUsername());
        response.setProfilePicture(comment.getUser().getProfilePicture());
        return response;
    }
}