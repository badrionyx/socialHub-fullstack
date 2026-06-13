package hub.social.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import hub.social.DTO.UserResponse;
import hub.social.Entity.User;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final Cloudinary cloudinary;
	private final UserRepo userRepository;

//	@Value("${file.upload-dir}")
//	private String uploadDir;

	public UserResponse getUserById(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
		return mapToResponse(user);
	}

	public List<UserResponse> searchUsers(String query) {
		return userRepository.searchByUsername(query).stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	public UserResponse uploadProfilePicture(Long userId, MultipartFile file) throws IOException {

		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new RuntimeException("Only image files are allowed");
		}

		var uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

		String imageUrl = uploadResult.get("secure_url").toString();

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		user.setProfilePicture(imageUrl);
		userRepository.save(user);
		return mapToResponse(user);
	}

	private UserResponse mapToResponse(User user) {
		UserResponse response = new UserResponse();
		response.setId(user.getId());
		response.setUsername(user.getUsername());
		response.setEmail(user.getEmail());
		response.setBio(user.getBio());
		response.setProfilePicture(user.getProfilePicture());
		return response;
	}
}
