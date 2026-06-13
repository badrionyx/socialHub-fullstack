package hub.social.DTO;

import java.time.Instant;

import lombok.Data;

@Data
public class PostResponse {
	private Long id;
	private String content;
	private String imageUrl;
	private Instant createdAt;

	// author info
	private Long userId;
	private String username;
	private String profilePicture;

	// counts
	private int likeCount;
	private int commentCount;
	private boolean likedByMe; // did the logged-in user like this?
}