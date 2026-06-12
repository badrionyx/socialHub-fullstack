package hub.social.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import hub.social.DTO.UserResponse;
import hub.social.Entity.User;
import hub.social.Repository.UserRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepo userRepository;

	@Value("${file.upload-dir}")
	private String uploadDir;

	public UserResponse getUserById(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return mapToResponse(user);
	}

	public List<UserResponse> searchUsers(String query) {
		return userRepository.searchByUsername(query).stream()
				.map(this::mapToResponse).collect(Collectors.toList());
	}

	public UserResponse uploadProfilePicture(Long userId, MultipartFile file) throws IOException {

		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new RuntimeException("Only image files are allowed");
		}

		Path uploadPath = Paths.get(uploadDir);
		if (!Files.exists(uploadPath)) {
			Files.createDirectories(uploadPath);
		}

		String originalFilename = file.getOriginalFilename();
		String extension = "";
		if (originalFilename != null && originalFilename.contains(".")) {
			extension = originalFilename.substring(originalFilename.lastIndexOf("."));
		}
		String uniqueFilename = UUID.randomUUID().toString() + extension;

		Path filePath = uploadPath.resolve(uniqueFilename);
		Files.write(filePath, file.getBytes());

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (user.getProfilePicture() != null) {
			Path oldFile = uploadPath.resolve(user.getProfilePicture());
			Files.deleteIfExists(oldFile);
		}

		user.setProfilePicture(uniqueFilename);

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
