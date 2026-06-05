package hub.social.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // this is a config class
@EnableWebSecurity // enable Spring Security
public class SecurityConfig {

	private final JWT_Filter jwtFilter;

	public SecurityConfig(JWT_Filter jwtFilter) {
		this.jwtFilter = jwtFilter;
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// RULE 1: Disable CSRF (not needed for REST APIs)
				.csrf(csrf -> csrf.disable())

				// RULE 2: Don't use sessions — we use JWT instead
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// RULE 3: Which routes need login?
				.authorizeHttpRequests(auth -> auth
						// /api/auth/register and /api/auth/login → NO login needed
						.requestMatchers("/api/auth/**").permitAll()
						// everything else → MUST have valid JWT token
						.anyRequest().authenticated())

				// RULE 4: Run our JwtFilter before checking login
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	// BCrypt password hasher
	// "123456" → "$2a$10$N9qo8uLOickgx2ZMRZo..." (one-way hash)
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}