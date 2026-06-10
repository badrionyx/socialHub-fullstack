package hub.social.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import hub.social.DTO.PostRequest;
import hub.social.DTO.PostResponse;
import hub.social.Entity.Post;
import hub.social.Entity.User;
import hub.social.Repository.LikeRepo;
import hub.social.Repository.PostRepo;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

	private final PostRepo postRepository;
	private final UserRepo userRepository;
	private final LikeRepo likeRepository;

	
	public PostResponse createPost(PostRequest request, Long userId) {

	
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		
		Post post = new Post();
		post.setContent(request.getContent());
		post.setImageUrl(request.getImageUrl());
		post.setUser(user);

		// save to DB
		Post saved = postRepository.save(post);

		return mapToResponse(saved, userId);
	}

	public List<PostResponse> getAllPosts(Long loggedInUserId) {
		return postRepository.findAllByOrderByCreatedAtDesc().stream().map(post -> mapToResponse(post, loggedInUserId))
				.collect(Collectors.toList());
	}

	public PostResponse getPostById(Long postId, Long loggedInUserId) {
		Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
		return mapToResponse(post, loggedInUserId);
	}

	public List<PostResponse> getPostsByUser(Long userId, Long loggedInUserId) {
		return postRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(post -> mapToResponse(post, loggedInUserId)).collect(Collectors.toList());
	}

	public void deletePost(Long postId, Long userId) {
		Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

		
		if (!post.getUser().getId().equals(userId)) {
			throw new RuntimeException("You can only delete your own posts");
		}

		postRepository.delete(post);
	}

	//  Helper — it will converts Post entity → PostResponse DTO
	private PostResponse mapToResponse(Post post, Long loggedInUserId) {
		PostResponse response = new PostResponse();
		response.setId(post.getId());
		response.setContent(post.getContent());
		response.setImageUrl(post.getImageUrl());
		response.setCreatedAt(post.getCreatedAt());

		// author details
		response.setUserId(post.getUser().getId());
			response.setUsername(post.getUser().getUsername());
		response.setProfilePicture(post.getUser().getProfilePicture());

		// like count
		response.setLikeCount(likeRepository.countByPostId(post.getId()));

		// comment count
		response.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);

		response.setLikedByMe(likeRepository.findByUserIdAndPostId(loggedInUserId, post.getId()).isPresent());

		return response;
	}
}