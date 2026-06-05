package hub.social.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {

	@NotBlank(message = "Post content cannot be empty")
	@Size(max = 500, message = "Post cannot exceed 500 characters")
	private String content;

	private String imageUrl; // optional — can be null
}