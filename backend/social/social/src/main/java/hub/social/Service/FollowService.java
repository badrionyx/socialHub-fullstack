package hub.social.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import hub.social.DTO.PostResponse;
import hub.social.Entity.Follow;
import hub.social.Entity.User;
import hub.social.Repository.FollowRepo;
import hub.social.Repository.PostRepo;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepo followRepository;
    private final UserRepo userRepository;
    private final PostRepo postRepository;
    private final PostService postService;


    public String follow(Long followingId, Long followerId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        Optional<Follow> existing =
            followRepository.findByFollowerIdAndFollowingId(followerId, followingId);

        if (existing.isPresent()) {
            throw new RuntimeException("You already follow this user");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepository.save(follow);

        return "You are now following " + following.getUsername();
    }

    public String unfollow(Long followingId, Long followerId) {
        Follow follow = followRepository
                .findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new RuntimeException("You don't follow this user"));

        followRepository.delete(follow);
        return "Unfollowed successfully";
    }

    public List<String> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId)
                .stream()
                .map(f -> f.getFollower().getUsername())
                .collect(Collectors.toList());
    }

    public List<String> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId)
                .stream()
                .map(f -> f.getFollowing().getUsername())
                .collect(Collectors.toList());
    }

    public List<PostResponse> getFeed(Long userId) {
        // get all userIds that I follow
        List<Long> followingIds = followRepository.findByFollowerId(userId)
                .stream()
                .map(f -> f.getFollowing().getId())
                .collect(Collectors.toList());

        if (followingIds.isEmpty()) {
            return List.of(); // return empty feed if following nobody
        }

        // get their posts newest first
        return postRepository.findByUserIdInOrderByCreatedAtDesc(followingIds)
                .stream()
                .map(post -> postService.getPostById(post.getId(), userId))
                .collect(Collectors.toList());
    }
}