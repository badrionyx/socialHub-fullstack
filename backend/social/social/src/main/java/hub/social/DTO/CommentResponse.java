package hub.social.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
	private Long id;
	private String content;
	private LocalDateTime createdAt;
	private Long userId;
	private String username;
	private String profilePicture;
}