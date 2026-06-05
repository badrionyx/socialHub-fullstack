package hub.social.Service;


import java.util.Optional;

import org.springframework.stereotype.Service;

import hub.social.Entity.Like;
import hub.social.Entity.Post;
import hub.social.Entity.User;
import hub.social.Repository.LikeRepo;
import hub.social.Repository.PostRepo;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepo likeRepository;
    private final PostRepo postRepository;
    private final UserRepo userRepository;

    
    public String likePost(Long postId, Long userId) {
        // check if already liked
        Optional<Like> existing = likeRepository.findByUserIdAndPostId(userId, postId);

        if (existing.isPresent()) {
            throw new RuntimeException("You already liked this post");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Like like = new Like();
        like.setPost(post);
        like.setUser(user);
        likeRepository.save(like);

        return "Post liked!";
    }

   
    public String unlikePost(Long postId, Long userId) {
        Like like = likeRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new RuntimeException("You haven't liked this post"));

        likeRepository.delete(like);
        return "Post unliked!";
    }

   
    public int getLikeCount(Long postId) {
        return likeRepository.countByPostId(postId);
    }
}